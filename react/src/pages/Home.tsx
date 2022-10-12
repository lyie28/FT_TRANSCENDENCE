/* Manon aurelie */

import Logo from '../components/Logo';
import Game from '../components/Game';
import UserProfil from '../components/UserProfil';
import Chat from '../components/Chat';
import { useEffect, useState } from 'react';
import axios from 'axios';
import {socket} from '../components/Socket';
import SideBarChat from '../components/SideBatChat';
import '../components/css/globalStyle.css';


/* Style (insere dans la div jsx) */
const headStyle = {    
	display: 'flex',
	justifyContent: 'space-between',
	boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
	zIndex: "10"
} as React.CSSProperties;

const bodyLogoutStyle = {
	display: 'flex',
	width:"100%",
	justifyContent:'center',
} as React.CSSProperties;

const bodyStyle = {
	display: 'flex',
	marginTop: '32px',
	width:"100%",
	justifyContent: 'flex-end',
}as React.CSSProperties;

const thankStyle = {
	position:'absolute' as 'absolute',
	top:'50%'
} as React.CSSProperties;

const gameStyle = {
	width: "70%",
	flexDirection: "column", // pour que le bouton soit en dessous du jeu
} as React.CSSProperties;


const Home = () => {
   
	const [profil, setProfil] = useState([] as any);
	const [login, setLogin] = useState(false);
	const [charging, setCharging] = useState(true);
	
	useEffect(() => {        
	   axios.get("http://localhost:3000/users", { withCredentials:true })
	   .then((res) =>{ 
			setProfil(res.data);
			setCharging(false);
			setLogin(true);
			socket.emit('whoAmI', res.data);
		})
		.catch(error => {
			if (error.response && error.response.status)
			{
				if (error.response.status === 403)
					window.location.href = "http://localhost:4200/";
				else
					console.log("Error: ", error.response.code, " : ", error.response.message);
			}
			else if (error.request)
				console.log("Unknown error");
			else {
				console.log(error.message);
			}
		})

	socket.on('logout', data => {
		socket.emit('disco');
		setProfil([]);
		setLogin(false);
	});
		socket.on("changeInfos", data => {
		  axios.get("http://localhost:3000/users", {withCredentials:true}).then((res) =>{
		  	setProfil(res.data);  
		  })
		  .catch(error => {
			if (error.response && error.response.status)
			{
				if (error.response.status === 403)
					window.location.href = "http://localhost:4200/";
				else
					console.log("Error: ", error.response.code, " : ", error.response.message);
			}
			else if (error.message)
				console.log(error.message);
			else
				console.log("unknown error");
		})
	});
	}, [])
	if (charging)
	{
		return null;
	}
	else if (login)
	{
		return (
		 <div>
			<div className="root" style={headStyle}>
				<Logo></Logo>
				<UserProfil dataFromParent={profil}></UserProfil>
			</div>
			<div style={bodyStyle}>
				<Game style={gameStyle} dataFromParent={profil}/>
				<SideBarChat user={profil}/>
				<Chat dataFromParent={profil}></Chat>
			</div>
		</div>
	);
	}
	else
		return (
		<div>
			<div style={headStyle}>
		 		<Logo></Logo>
		 		<UserProfil dataFromParent={profil}></UserProfil>
	 		</div>
	 		<div style={bodyLogoutStyle}>
				<div style={thankStyle}><p><b>Thank you! See you soon !</b></p></div>
			</div>
 		</div>
		);
};

export default Home;

