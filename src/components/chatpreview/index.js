import { h } from 'preact';
import { Link } from 'preact-router/match';

import style from "./style.css"

const Preview = ({ user_id, user_name }) => (
    <div class="border-bottom">
        <Link href={`/chat/${user_id}`} class={`lead py-1 w-100 col-12 ${style.previewLink}`} activeClassName="text-dark bg-light">
            {user_name}
            {/* <span class="text-right w-25 d-inline-block"><span class="text-success">●</span></span> */}
        </Link>
    </div>
);

export default Preview;
