import React, { useEffect, useState } from 'react';
import Logo from './Logo';
import Select from 'react-select';
import { socket } from "./Socket";
import CSS from 'csstype';
import axios from 'axios';

const log: CSS.Properties = {
	position : 'relative',
	top : '5%',
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
	padding:'16px',
	zIndex: '9999',
	transform: 'translate(-50%, -50%)'
}

const button: CSS.Properties = {
	position: 'absolute',
	right: '32px',
	top: '32px'
}

  
const AddPrivateMember = ({idRoom, roomName, revele, toggle, toggle2}) => {
	const [allUser, setAllUsers] = useState([]);
	const [members, setMembers] = useState([]);
	useEffect(() => { 
		axios.get("http://localhost:3000/users/allNoMembers/" + idRoom, {withCredentials:true}).then((res) =>{
			let tab = [];
			for (let entry of res.data)
				tab.push({value: entry.id, label:entry.login});
			setAllUsers(tab);
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
			else
				console.log(error.message);
		})
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
			else if (error.request)
				console.log("Unknown error");
			else
				console.log(error.message);
		})        
	}, [idRoom])
  
	const [option, setOption] = useState(-1);
	const [lab, setLab] = useState("");
	const [value, setValue] = useState({value: -1, label:"Choose a user"});
	const handleChange = (e) => {
		setValue({value:e.value, label:e.label});
		setOption(e.value);
		setLab(e.label);
	}

	const reset = () => {
		setOption(-1);
		setValue({value: -1, label:"Choose a user"});
		toggle();
		toggle2();
	}

	const add = () => {
		if (option === -1)
			return ;
		else {
			socket.emit('user_joins_room', {userId: option, room: roomName, roomId: idRoom});
			let tabU = allUser.filter(element => element.value !== option)
			setAllUsers(tabU);
			let tab = members;
			tab.push({value:option, label:lab});
			setMembers(tab);
			setValue({value: -1, label:"Choose a user"});
			setOption(-1);
			setLab("");
		}
	}

	if (revele) {
		return (
			<div>
			<div style={background} />
				<div style={modale}>
				<div style={log}>
						<Logo/>
					</div>
			<div style={{display:'flex', justifyContent:'space-around', position:"relative",top:"20%"}}>
			<div style={{ width:'50%', maxHeight:'300px', borderRight:'solid', borderColor:'grey'}}>
				<h2>Members</h2>
					{members.map(data => (<div key={data.value}> {data.label}</div>))}
				
					</div>
			<div style={{width :'50%', top:"50%", paddingLeft:'16px'}}>

			<div style={{position:"relative",top:"20%"}}>
						<Select onChange={handleChange} options={allUser} value={value}/>
				</div>
				<div style={watchButton}><button  type='button' onClick={add}>Add</button>
				</div>
			</div>
			</div>
			<button style={button} type='button' onClick={reset}> x </button>
			</div>
			</div>
		)
	}
	else
		return null;
};

export default AddPrivateMember;