import React, { useState, useEffect } from "react";
import io from "socket.io-client";

export const socket = io('http://localhost:3000');

const Socket= () => {

	const [response, setResponse] = useState("");
	// instance of websocket connection as a class property

   useEffect(() => {
		socket.on("users", data => {
		   setResponse(data);
		});
		socket.emit('chat', 'okok');
	}, []);

	return (
		<p>
			It's <time dateTime={response}>{response}</time>
		</p>
	);
}

export default Socket