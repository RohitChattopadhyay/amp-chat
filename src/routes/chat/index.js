import { h } from 'preact';
import { useState, useRef, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import { API, graphqlOperation } from 'aws-amplify'
import stc from 'string-to-color'
import image_icon from "../../assets/img_icon.png"
import chat_bg from "../../assets/chat_bg.jpg"
import "./style.css"

const GetConvo = /* GraphQL */`query GetConversation($chatid: ID!) {
	getConvo(id: $chatid) {
	  members
	  messages(sortDirection: ASC) {
		items {
			id
			img
		  	authorId
		  	content
		  	createdAt
		}
	  }
	}
  }
`
const CreateMessage = /* GraphQL */`mutation CreateMsg($content:String!, $chatid: ID!, $username: String, $image: String=null) {
	createMessage(input: {content: $content, messageConversationId: $chatid, authorId: $username, img: $image}) {
	  id
	}
  }
`
const sub_onCreateMessage = /* GraphQL */`subscription OnCreateMsg($chatid: ID!) {
	onCreateMessage(messageConversationId: $chatid) {
	  conversation {
		messages(sortDirection: ASC) {
		  items {
			content
			img
			createdAt
			authorId
			id
		  }
		}
	  }
	}
  }
  
`

const Message = ({ text = null, img = null, time, dir = "left", name = null, username }) => {
	const [showModal, setShowModal] = useState(false)
	const toggleModal = () => {
		setShowModal(!showModal)
	}
	return (
		<div class={`col-12 my-2 text-${dir}${dir == "left" ? " text-white" : ""}`}>
			{name != username && <p class="text-left mb-0" style={{ color: stc(name) }}><small><em><strong>{name}</strong></em></small></p>}
			{
				img ? <div><div class={`d-block w-25 float-${dir} shadow border border-black rounded  bg-${dir == "left" ? "dark" : "light"}`}>
					<img src={img} class="w-100 rounded border" onClick={toggleModal} />
					<div class="clearfix" />
				</div>
					<div class="clearfix" />
					{showModal ? <Modal src={img} toggle={toggleModal} /> : null}
				</div> : <div class={`d-inline-block py-1 px-2 rounded border-black border shadow bg-${dir == "left" ? "dark" : "light"}`}>

						{
							text && <p class="my-0" style={{ wordBreak: "break-all" }}>{text}</p>
						}
					</div>
			}
			<small className="d-block text-primary">{new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
		</div>
	)
}

const Modal = ({ src, toggle }) => (
	<dialog open class={"modal in h-100 w-100 visible"} onClick={toggle}>
		<center>
			<img style={{ maxWidth: "12wh", maxHeight: "95vh" }} src={src} />
		</center>
	</dialog>
)

const Chat = ({ chatid, userid, setLoading }) => {
	const [username, setUsername] = useState(userid)
	const endDiv = useRef(null);
	const [message, setMessage] = useState("")
	const [messages, setMessages] = useState([])
	const [members, setMembers] = useState([])
	const imgAttach = useRef(null)

	useEffect(async () => {
		const chat_details = await API.graphql(graphqlOperation(GetConvo, { chatid }))
		const { errors, getConvo } = chat_details.data
		if (errors || !getConvo) {
			alert("Unauthorized")
			route("/")
			return
		}
		setMessages(getConvo.messages.items)
		setMembers(getConvo.members ? getConvo.members : [])
		const sub = await API.graphql(graphqlOperation(sub_onCreateMessage, { chatid })).subscribe({
			next: (eventData) => setMessages(eventData.value.data.onCreateMessage.conversation.messages.items),
			error: error => {
				console.warn(error);
			}
		})

		return () => sub.unsubscribe()
	}, [chatid, userid])

	useEffect(() => {
		endDiv.current.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	const sendMessage = async (image = null) => {
		const msg = await API.graphql(graphqlOperation(CreateMessage, { content: message, chatid, username, image }))
		const { error } = msg
		console.log(msg)
		if (!error)
			setMessage("")
	}

	const handleFileUpload = async (e) => {
		const files = Array.from(e.target.files)
		files.map(async file => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = async () => {
				const form = new FormData();
				form.append("image", file)
				const response = await fetch("https://api.imgbb.com/1/upload?key=afd831b4ec678fb8f26d58885cd09312", {
					body: form,
					method: "POST"
				})
				const data = await response.json()
				sendMessage(data.data.display_url)
			};
			reader.onerror = error => alert(error);
		})
	}

	return (
		<div class="col-12 px-0">
			<div class="col-12 bg-light">
				<div class="border-bottom row py-2">
					<div class="col-3 col-sm-1"><img style={{ maxHeight: "3.3em" }} class=" border-dark border rounded-circle bg-white" src={"https://robohash.org/" + chatid + "?set=set3"} /></div>
					<div class="col-9 col-sm-11 pt-1">
						<h3>{chatid}</h3>
					</div>
				</div>
			</div>
			<div class="col-12 py-0">
				<div class="row d-block px-3" style={{ overflowY: "scroll", height: "74.6vh", backgroundImage: 'url(' + chat_bg + ')' }}>
					{
						messages.map(({ content, authorId, createdAt, img }) => <Message img={img} text={content} name={authorId} time={createdAt} username={username} dir={authorId == username ? "right" : "left"} />)
					}
					<div ref={endDiv} />
				</div>
			</div>
			<div class="bg-light border-top py-2" style={{ left: 0, bottom: 0 }}>
				<div class="input-group px-3">
					<input type="text" class="form-control" placeholder="Type a Message"
						value={message}
						onInput={e => setMessage(e.target.value)}
					/>
					<div class="input-group-append">
						<input class="d-none" type="file"
							accept=".jpeg,.jpg,.png"
							onChange={handleFileUpload}
							ref={imgAttach} />
						<button class="btn btn-outline-secondary" onClick={() => imgAttach.current.click()} type="button"><img style={{ maxWidth: "1.5em" }} src={image_icon} /></button>
						<button class="btn btn-primary rounded-right" type="button" onClick={() => sendMessage()}>Send</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Chat;
