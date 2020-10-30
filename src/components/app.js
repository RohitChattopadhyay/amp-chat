import { h } from 'preact';
import { Router } from 'preact-router';

import Header from './header';

// Code-splitting is automated for `routes` directory
import Chat from '../routes/chat';
import Home from '../routes/home'
import ChatPreview from './chatpreview'
import { useState } from 'preact/hooks';

const App = () => {
	const [search, setSearchTerm] = useState("")
	const [online_users, setOnlineUsers] = useState([{
		id: 12345,
		name: "Rohit"
	},
	{
		id: 123456,
		name: "Rohit2"
	}])
	return (
		<div id="app">
			<div class="container mt-4 shadow-lg bg-white">
				<div class="row h-100">
					<div class="col-sm-3 d-none d-sm-block px-0 border-right">
						<div class="bg-light pt-1">
							<h3 class="pl-3 pt-2 pb-3 mb-0">Messenger</h3>
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
						<Router>
							<Chat path="/chat/:chatid" />
							<Home path="/"/>
						</Router>
					</div>
				</div>
			</div>
		</div>
	)
}

export default App;
