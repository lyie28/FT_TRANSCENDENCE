/* sam  john aurelie */
import {socket} from './Socket';
import {useState, useEffect} from 'react';
import { ModalWindow } from './ModaleWindow/LogiqueModale2';
import MaterialIcon from 'material-icons-react';
import axios from 'axios';
import './css/globalStyle.css'


const pwdStyle = {
	display: "flex",
	flexDirection: 'column' as 'column',
	justifyContent: "center",
	alignItems: 'center',
	
   } as React.CSSProperties;

const createChannelStyle ={
	display: "flex",
	flexDirection: "column" as "column",
	width: "50%"
}


/* Join des channels, create des channels */
const AddChannel = ({user}) => {
  
	const[message, setMessage] = useState('');
	const[mes, setMes] = useState(false);
	const [currentSal, setCurrentSal] = useState(0); 
	const [currentName, setCurrentName] = useState(0); 
	const [salons, setSalons] = useState([]); //Array de tous les salons a afficher, que l'on peut selectionner
	const [newSalon, setNewSalon] = useState(0); //Array de tous les salons a afficher, que l'on peut selectionner
	const [inf, setInf] = useState('');
	const [reveleAdd, setReveleAdd] = useState(false);
	const toggleAdd = () => {setReveleAdd(!reveleAdd);}
	const [revele, setRevele] = useState(false);
	const toggle = () => {setRevele(!revele);}
	const [err, setErr] = useState("");
	
	useEffect(() => {
		setNewSalon(0); 
		socket.on('fetchsalon', data => {
		setSalons(data);
	   });
	  socket.emit('fetchsalon', user.id);
	}, [newSalon, user.id])

	
	const handleChange = event => {
		setErr("");
		setMessage(event.target.value);
	};

	const check = () => {
		const info = {roomId:currentSal, pwd:inf}
		axios.post("http://localhost:3000/users/checkpwd/", info, {withCredentials: true}).then((res) => {
			if (res.data === true)
			{
				setMes(false);
				socket.emit('user_joins_room', {userId: user.id, room: currentName, roomId:currentSal});
				toggle();
			}
			else {
				setMes(true);
			}
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
	}
	socket.on("invalid", data => {
		toggleAdd();
		setErr("Invalid name, too large or invalid character")
	});
	const handleClick = (salon) => { 
		axios.get("http://localhost:3000/users/pwd/" + salon.id, {withCredentials: true}).then((res) => {
			if (res.data === true) {
				setCurrentSal(salon.id);
				setCurrentName(salon.name);
				toggle();
			}
			else
				socket.emit('user_joins_room', {userId: user.id, room: salon.name, roomId:salon.id});
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
	};

	const sendNewSalon = (bool, text) => {
		if (message.trim().length === 0) {
			alert('Channel name cant be empty');
			return;
		}
		socket.emit('addsalon', user.id, bool, false, text);//, actualUser.id); 
		setNewSalon(1);
		setMessage('');
		toggleAdd();     
	};

	const handleChange2 = (event) => { setInf(event.target.value);  }
	
	return(
		<div>	
			<button onClick={toggleAdd} ><MaterialIcon title="Add channel"  size="medium" icon="maps_ugc" /></button>
			<h2 className="mediumMarginBottom">Join existing channels</h2>    
			<div className='lists'>
			{salons.map((salon) => ( 
			<button  key={salon.id} onClick={() => handleClick(salon)}>
				<div key={salon.id}>{salon.display}</div>
			</button>))}</div>

			<ModalWindow revele={reveleAdd} setRevele={toggleAdd}>
				<h2>Create a new Channel</h2>
			<div style={createChannelStyle}>
				
				<h3>Enter a channel' name</h3>
				<input className="mediumMarginBottom" type='text' id="message" name="message" onChange={handleChange} value={message}/>
				<b>{err}</b>
				<button className="mediumMarginBottom" onClick={() => sendNewSalon(false, message)}>Create public channel</button>
				<button className="mediumMarginBottom" onClick={() => sendNewSalon(true, message)}>Create private channel</button>
				
				</div>
			</ModalWindow>
			<ModalWindow revele={revele} setRevele={toggle}>
				<div style={pwdStyle}>    
					<h2>Please enter password</h2>
					<input style={{marginBottom: '16px'}} type='password' onChange={(event) =>handleChange2(event)}></input>
					<button onClick={check}>Send</button>
					<b>{mes ? 'wrong password...' : ''}</b>

				</div>
			</ModalWindow>
		</div>
	);
}

export default AddChannel