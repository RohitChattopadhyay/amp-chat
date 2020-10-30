import { h } from 'preact';
import { Link } from 'preact-router/match';
import style from './style.css';

const Header = () => (
	<header class={style.header}>
		<h1 class="display-4">Messenger</h1>
		<nav>
			<Link href="/">Log Out</Link>
		</nav>
	</header>
);

export default Header;
