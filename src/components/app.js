import { h } from 'preact';
import { Router } from 'preact-router';

import { API, graphqlOperation, Auth } from 'aws-amplify'
import { useState, useEffect } from 'preact/hooks';

// Code-splitting is automated for `routes` directory
import Chat from '../routes/chat';
import Home from '../routes/home'
import ChatPreview from './chatpreview'
import loader_img from "../assets/loader.gif"
import signout_img from "../assets/signout.png"

import './style.css'

const CreateUser = /* GraphQL */ `mutation CreateUser($username: String!, $id: ID!) {
	createUser(input: {username: $username, id: $id}) {
	  username
	  conversations {
		items {
		  conversation {
			name
			id
		  }
		}
	  }
	}
  }
`

const GetUser = /* GraphQL */`query GetUser($id: ID!) {
	getUser(id: $id) {
	  conversations {
		items {
		  conversation {
			name
			id
		  }
		}
	  }
	}
  }
`

const App = () => {
	const [search, setSearchTerm] = useState("")
	const [showLoading, setShowLoading] = useState(true)
	const [online_users, setOnlineUsers] = useState([])
	const [username, setUserName] = useState(null)

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
	},[]);

	const checkIfUserExists = async (id) => {
		try {
			const user = await API.graphql(graphqlOperation(GetUser, { id: id }))
			const { getUser } = user.data
			if (!getUser) {
				await createUser(id)
			} else {
				console.log('me:', getUser)
				setOnlineUsers(getUser.conversations.items)
				setShowLoading(false)
			}
		} catch (err) {
			console.log('error fetching user: ', err)
		}
	}

	const signOut = async () => {
		try {
			await Auth.signOut();
			window.location = "/"
		} catch (error) {
			console.log('error signing out: ', error);
		}
	}

	const createUser = async (username) => {
		try {
			console.log(username)
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

	const AuthorizedScreens = () => <div id="app">
		<div class="container mt-4 shadow-lg bg-white">
			<div class="row h-100">
				<div class="col-sm-3 d-none d-sm-block px-0 border-right">
					<div class="bg-light pt-2 pb-2">
						<h3 class="pl-3 pt-1 pb-2 mb-0 d-inline-block">Messenger</h3> <span class="pr-2 pt-2 font-weight-bold" style={{ float: 'right' }}><img src={signout_img}  onClick={()=>signOut()} style={{ maxWidth: "1.5em", marginTop: ".25em" }} /></span>
					</div>
					<div class="input-group input-group-sm">
						<input type="text" class="form-control rounded-0 border-left-0" value={search} onInput={(e) => setSearchTerm(e.target.value)} placeholder="Search" />
						<div class="input-group-append">
							<div class="btn btn-secondary-outline border rounded-0 border-right-0" type="submit">⌕</div>
						</div>
					</div>
					<div className="pt-1" style={{ overflowY: "scroll", height: "70vh" }}>
						{
							online_users.filter(({ name }) => name.toLowerCase().indexOf(search.toLowerCase()) > -1).map(user => <ChatPreview user_id={user.id} user_name={user.name} />)
						}
					</div>
					<div class="bg-light border-top py-2" style={{ left: 0, bottom: 0 }}>
						<div class="input-group px-3">
							<input type="text" class="form-control" placeholder="Chatroom Name" aria-label="Recipient's username" aria-describedby="basic-addon2" />
							<div class="input-group-append">
								<button class="btn btn-outline-primary rounded-right" type="button">Join</button>
							</div>
						</div>
					</div>
				</div>
				<div class="col-sm-9 px-0 ">
					{
						showLoading ? <LoadingScreen /> : <Router>
							<Chat path="/chat/:chatid" setLoading={setShowLoading} />
							<Home path="/" setLoading={setShowLoading} />
						</Router>
					}
				</div>
			</div>
		</div>
	</div>

	return <AuthorizedScreens />



}

export default App;
