import { h } from 'preact';

import welcome_img from '../../assets/welcome.png'

const Home = () => (
	<div class="col-12 px-0 h-100 bg-light pt-5" style={{ borderBottom: "solid #128C7E 0.5em" }} >
		<div class="text-center mt-3">
			<img src={welcome_img} class="" style={{
				  filter: 'drop-shadow(-1px -1px 2px #128C7E)'
			}}/>
			<p class="lead mt-5 mb-0">Welcome to Messenger</p>
			<p>Join Rooms from left</p>
		</div>
	</div>

);

export default Home;
