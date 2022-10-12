import React, { useEffect, useState } from 'react';
import Logo from './Logo';
import Select from 'react-select';
import { socket } from "./Socket";
import CSS from 'csstype';
import axios from 'axios';

const log: CSS.Properties = {
	// position : 'relative',
	// top : '5%',
}

const watchButton: CSS.Properties = {
	position : 'relative',
	top : '40%',
}

/* Assombri l'arriere plan */
const background: CSS.Properties = {
	background: 'rgba(0,0,0,0.5)',
	position: 'absolute',
	top: '0',
	left: '0',
	right: '0',
	bottom: '0',
	zIndex: '9998'
}

const modale: CSS.Properties = {
	height: '500px',
	width: '700px',
	background: 'white',
	position: 'absolute',
	top: '50%',
	left: '50%',
	zIndex: '9999',
	padding:'16px',
	transform: 'translate(-50%, -50%)'
}

const button: CSS.Properties = {
	position: 'absolute',
	right: '15px',
	top: '15px'
}

  
const OwnerLeave = ({idRoom, idUser, roomName, revele, toggle, toggle2, revele2}) => {
	const [members, setMembers] = useState([]);
  
	useEffect(() => {
			axios.get("http://localhost:3000/users/members/" + idRoom, {withCredentials:true}).then((res) =>{
				setMembers(res.data)
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
	
		}, [idRoom])
  
	const [option, setOption] = useState(-1);

	const handleChange = (e) => {
		setOption(e.value);
	}

	const reset = () => {
		setOption(-1);
		toggle();
	}

	const deleteRoom = () => {
		socket.emit('delete_room', {userId: idUser, room: roomName, roomId: idRoom});
		toggle();
		toggle2();
	}
	
	const leave = () => {
		if (option === -1 || option === idUser)
		{
			alert('Invalid successor!')
			return ;
		}
		else
		{
			const info = { newCreator : option, roomId:idRoom};
			axios.post("http://localhost:3000/users/setNewCreator", info, {withCredentials:true}).then((res) =>{   
				socket.emit('new-owner', option);
				socket.emit('user_leaves_room', {userId: idUser, room: roomName, roomId: idRoom});
				toggle();
				toggle2();
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
		}
	}

	if (revele) {
		return(
			<div>
				<div style={background} />
				<div style={modale}>
					<div style={log}>
						<Logo/>
					</div>
					<div style={{display:'flex', justifyContent:'space-between', position:"relative",top:"20%"}}>
						<div style={{width :'50%', top:"50%", borderRight:'solid', borderColor:'grey', paddingRight:'16px'}}>
							<h2>Choose a successor and leave room...</h2>
							<div style={{position:"relative",top:"20%"}}>
								<Select onChange={handleChange} options={members}/>
							</div>
							<div style={watchButton}><button className='largeButton' type='button' onClick={leave}>Leave</button></div>
						</div>
						<div style={{width:'30%'}}>
							<h2>or delete it</h2>
							<div style={watchButton}><button className='largeButton' type='button' onClick={deleteRoom}>Delete</button></div>
						</div>
					</div>
				<button style={button} type='button' onClick={reset}>x</button>
				</div>
			</div>
		)
	}	
	else
		return null;
};

export default OwnerLeave;