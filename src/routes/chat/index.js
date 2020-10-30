import { h } from 'preact';
import { useState } from 'preact/hooks';
import stc from 'string-to-color'
import image_icon from "../../assets/img_icon.png"
import chat_bg from "../../assets/chat_bg.jpg"
import "./style.css"

const Message = ({ text = null, img = null, time, dir = "left", name = null }) => {
	const [showModal, setShowModal] = useState(false)
	const toggleModal = () => {
		setShowModal(!showModal)
	}
	return (
		<div class={`col-12 my-2 text-${  dir  }${dir == "left" ? " text-white" : ""}`}>
			{name && <p class="text-left mb-0" style={{ color: stc(name) }}><small><em><strong>{name}</strong></em></small></p>}
			{
				img ? <div><div class={`d-block w-25 float-${  dir  } shadow border border-black rounded  bg-${  dir == "left" ? "dark" : "light"}`}>
					<img src={img} class="w-100 rounded border" onClick={toggleModal} />
					<div class="clearfix" />
				</div>
					<div class="clearfix" />
					{showModal ? <Modal src={img} toggle={toggleModal} /> : null}
				</div> : <div class={`d-inline-block py-1 px-2 rounded border-black border shadow bg-${  dir == "left" ? "dark" : "light"}`}>
						
						{
							text && <p class="my-0" style={{ wordBreak: "break-all" }}>{text}</p>
						}
					</div>
			}
			<small className="d-block text-primary">{time}</small>
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

const Chat = ({ chatid }) => {
	return (
		<div class="col-12 px-0">
			<div class="col-12 bg-light">
				<div class="border-bottom row py-2">
					<div class="col-3 col-sm-1"><img style={{ maxHeight: "3.3em" }} class=" border-dark border rounded-circle" src={"https://i.pravatar.cc/150?u="+chatid} /></div>
					<div class="col-9 col-sm-11 pt-1">
						<h3>{chatid}</h3>
					</div>
				</div>
			</div>
			<div class="col-12 py-0">
				<div class="row d-block px-3" style={{ overflowY: "scroll", height: "74.6vh", backgroundImage:'url(' + chat_bg + ')' }}>
					<Message name="Rohit" text="Hi" time="18:10" />
					<Message name="Ronit" img="https://picsum.photos/536/354" text="Testing message" time="18:13" />
					<Message dir="right" text="Testing message" time="18:15" />
					<Message dir="right" text="Testing message" time="18:16" />
					<Message dir="left" name="Ronit" text="Testing message" time="18:17" />
					<Message dir="right" text="Testing message" time="18:18" />
				</div>
			</div>
			<div class="bg-light border-top py-2" style={{ left: 0, bottom: 0 }}>
				<div class="input-group px-3">
					<input type="text" class="form-control" placeholder="Type a Message" aria-label="Recipient's username" aria-describedby="basic-addon2" />
					<div class="input-group-append">
						<button class="btn btn-outline-secondary " type="button"><img style={{maxWidth:"1.5em"}} src={image_icon}/></button>
						<button class="btn btn-primary rounded-right" type="button">Send</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Chat;
