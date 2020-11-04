import { h } from 'preact';
import { Router, route } from 'preact-router';
import slugify from 'slugify';

import { API, graphqlOperation, Auth } from 'aws-amplify'
import { useState, useEffect } from 'preact/hooks';

// Code-splitting is automated for `routes` directory
import Chat from '../routes/chat';
import Home from '../routes/home'
import ChatPreview from './chatpreview'
import loader_img from "../assets/loader.gif"
import signout_img from "../assets/signout.png"

import './style.css'

const createConvo = /* GraphQL */`mutation CreateConvo($id: ID!, $members: [String!]) {
	createConvo(input: {id: $id, members: $members}) {
		id
	}
}
`

const sub_onCreateRoom = /* GraphQL */`subscription OnCreateRoom($userName: ID!) {
	onCreateConvoLink(convoLinkUserId: $userName) {
	  user {
		conversations {
		  items {
			conversation {
			  id
			}
		  }
		}
	  }
	}
  }
`

const createConvoLink = /* GraphQL */`mutation CreateConvoLink($user: ID!, $room: ID!) {
	createConvoLink(input: {convoLinkConversationId: $room, convoLinkUserId: $user}) {
	  id
	}
  }  
`

const CreateUser = /* GraphQL */ `mutation CreateUser($username: String!, $id: ID!) {
	createUser(input: {username: $username, id: $id}) {
	  username
	  conversations {
		items {
		  conversation {
			id
		  }
		}
	  }
	}
	createConvoLink(input: {convoLinkConversationId: "Broadcast", convoLinkUserId: $id}) {
	  id
	}
  }
`

const UpdateRoom = /* GraphQL */`mutation UpdateRoom($id: ID!, $members: [String!]) {
	addUser(input: {id: $id, members: $members}) {
		id
	}
}
`

const GetRoom = /* GraphQL */`query GetRoom($id: ID!){
	getConvo(id: $id) {
	  members
	}
  }
`

const GetUser = /* GraphQL */`query GetUser($id: ID!) {
	getUser(id: $id) {
	  conversations {
		items {
		  conversation {
			id
		  }
		}
	  }
	}
  }
`

const App = () => {
	const [showLoading, setShowLoading] = useState(true)
	const [online_users, setOnlineUsers] = useState([])
	const [username, setUserName] = useState(null)

	const [search, setSearchTerm] = useState("")
	const [roomId, setRoomId] = useState("")

	useEffect(() => {
		const onBoarding = async () => {
			let username;
			try {
				const user = await Auth.currentAuthenticatedUser()
				username = user.username
				setUserName(user.username)
			} catch (error) {
				console.log('error getting user data... ', err)
			}
			if (username !== '') {
				checkIfUserExists(username)
			}
		}
		onBoarding()
	}, []);

	useEffect(() => {
		if(username)
			subscription(username)
	}, [username])

	const subscription = async (userName) => {
		await API.graphql(
			graphqlOperation(sub_onCreateRoom, { userName })
		).subscribe({
			next: (eventData) => {
				console.log(eventData)
				if (eventData.value.data.onCreateConvoLink)
					setOnlineUsers(eventData.value.data.onCreateConvoLink.user.conversations.items)
			},
			error: error => {
				console.warn(userName, error);
			}
		})
	}

	const checkIfUserExists = async (id) => {
		try {
			const user = await API.graphql(graphqlOperation(GetUser, { id: id }))
			const { getUser } = user.data 
			if (!getUser) {
				await createUser(id)
			} else {
				console.log('me:', getUser)
				setOnlineUsers(getUser.conversations.items)
				console.log(getUser.conversations.items)
				setShowLoading(false)
			}
		} catch (err) {
			console.log('error fetching user: ', err)
		}
	}

	const signOut = async () => {
		try {
			await Auth.signOut();
			window.location.href = "/"
		} catch (error) {
			console.log('error signing out: ', error);
		}
	}

	const createUser = async (username) => {
		try {
			const createdData = await API.graphql({
				query: graphqlOperation(CreateUser).query,
				variables: {
					id: username,
					username: username
				}
			})
			setOnlineUsers(createdData.data.createUser.conversations.items)
			setShowLoading(false)
		} catch (err) {
			console.log('Error creating user! :', err)
		}
	}

	const LoadingScreen = () => <div class="col-12 px-0 h-100 pt-5 bg-light" style={{ borderBottom: "solid #128C7E 0.5em" }} >
		<div class="text-center mt-5 pt-5">
			<img src={loader_img} class=" mt-4 w-25" />
		</div>
	</div>

	const createRoom = async (room, users = []) => {
		try {
			const members = Array.from(new Set([username, ...users])).sort()
			if (members.length < 2)
				return
			const convo = { id: room, members }
			await API.graphql(graphqlOperation(createConvo, convo))
			members.map(async member => {
				let relation = { user: member.trim(), room }
				await API.graphql(graphqlOperation(createConvoLink, relation))
			})
			setRoomId("")
		} catch (err) {
			console.log('error creating conversation...', err)
		}
	}

	const joinRoom = async () => {
		const room = roomId.trim()
		if (room.length < 4)
			return
		const room_info = await API.graphql(graphqlOperation(GetRoom, { id: room }))
		const { getConvo } = room_info.data
		if (!getConvo || !getConvo.members) {
			//create group
			let users = window.prompt("Room doesnot exist, Enter usernames of group members to create one");
			if (users == null || users == "") {
				setRoomId("")
			}
			else {
				await createRoom(room, users.split(","))
				route('/chat/' + room)
			}
		}
		else {
			if (getConvo.members.indexOf(username) == -1) {
				// Group exists, adding user to room
				const members = getConvo.members || []
				members.push(username)
				members.sort()
				await API.graphql(graphqlOperation(UpdateRoom, { id: room, members: members }))
			}
			route('/chat/' + room)
			setRoomId("")
		}
	}

	const ChatPreviewGen = () => {

		if (online_users && online_users.length > 0) {
			const unq_set = new Set()
			const unq_arr = []
			online_users.map((user) => {
				const id = user.conversation.id
				if (!unq_set.has(id)) {
					unq_arr.push(user)
					unq_set.add(id)
				}
			})
			return <>
				{
					unq_arr.filter(({ conversation }) => conversation.id.toLowerCase().indexOf(search.toLowerCase()) > -1).sort().map(({ conversation }) => <ChatPreview user_id={conversation.id} user_name={conversation.id} />)
				}
			</>
		}
		else
			return <p class="text-center mt-5 pt-5">Create New Chat</p>
	}

	return <div id="app">
		<div class="container mt-4 shadow-lg bg-white">
			<div class="row h-100">
				<div class="col-sm-3 d-none d-sm-block px-0 border-right">
					<div class="bg-light container-fluid">
						<div class="row py-2">
							<div class="col-2">{username && <img style={{ maxHeight: "3.3em" }} class=" border-dark border rounded-circle bg-white" src={"https://robohash.org/" + username + "?set=set2"} />}</div>
							<div class="col-8">
								<h3 class="pl-2 pt-1 pb-2 mb-0 d-inline-block">Messenger</h3>
							</div>
							<div class="col-2">
								<img src={signout_img} onClick={() => signOut()} style={{ maxWidth: "1.75em", marginTop: ".75em" }} />
							</div>
						</div>
					</div>
					<div class="input-group input-group-sm">
						<input type="text" class="form-control rounded-0 border-left-0"
							value={search}
							placeholder="Search"
							onInput={e => setSearchTerm(e.target.value)}
						/>
						<div class="input-group-append">
							<div class="btn btn-secondary-outline border rounded-0 border-right-0" type="submit">⌕</div>
						</div>
					</div>
					<div className="pt-1" style={{ overflowY: "scroll", height: "70vh" }}>
						{
							<ChatPreviewGen />
						}
					</div>
					<div class="bg-light border-top py-2" style={{ left: 0, bottom: 0 }}>
						<div class="input-group px-3">
							<input type="text" class="form-control" placeholder="Chatroom ID"
								value={roomId}
								onInput={e => setRoomId(slugify(e.target.value))}
							/>
							<div class="input-group-append">
								<button class="btn btn-outline-primary rounded-right" type="button" onClick={() => joinRoom()}>Join</button>
							</div>
						</div>
					</div>
				</div>
				<div class="col-sm-9 px-0 ">
					{
						showLoading ? <LoadingScreen /> : <Router>
							<Chat path="/chat/:chatid" setLoading={setShowLoading} userid={username} />
							<Home default setLoading={setShowLoading} />
						</Router>
					}
				</div>
			</div>
		</div>
	</div>
}

export default App;
