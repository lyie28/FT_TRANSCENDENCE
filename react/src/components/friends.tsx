/*LAURA: friendlist, il appelle le modale Friendsmodale qui va afficher les amis d'utilisateur*/

import axios from 'axios';
import React, { useState, useEffect } from 'react';
import DisplayUser from './DisplayUser';
import { ModalWindow } from './ModaleWindow/LogiqueModale2';
import { socket } from './Socket';
import './css/globalStyle.css'

const Friends = ({user, toggleProfil, toggleProfil2}) => {
		const [friends, setFriends] = useState([]);
		/* Outils d'affichage de la modale */
		const [myId, setmyId] = useState([]);
		const [revele, setRevele] = useState(false);
		const toggleModal = () => {setRevele(!revele);} 
		/*------*/
	
			
		/*get friendlist*/
		useEffect(() => {
		axios.get("http://localhost:3000/friends/friendRequest/me/friendlist", {withCredentials:true}).then((res) =>{
				setFriends(res.data);
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
	}, [])

	/*get userId*/   
	axios.get("http://localhost:3000/users/getMyId", {withCredentials:true}).then((res) =>{
		setmyId(res.data);
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


	const togglePlay = () => {
		toggleProfil();
		toggleModal();

	}

	const togglePlay2 = () =>
	{
		toggleProfil2();
		toggleModal()
	}

	socket.on("changeFriends", ({sender}, {receiver}, data) => {
		if (sender === myId || receiver === myId)
		{
		  axios.get("http://localhost:3000/friends/friendRequest/me/friendlist", {withCredentials:true}).then((res) =>{
		  setFriends(res.data);
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
		}})

	return(
		<div>
				<button onClick={toggleModal}>Friends</button>
				<ModalWindow revele={revele} setRevele={toggleModal}>
						<h1>My friends</h1>
						<div className='lists'>    
						{friends.map(friends => (
							<div key={friends.id}>
								<DisplayUser userConnected={user} userSelected={friends} isFriend={true} togglePlay={togglePlay} togglePlay2={togglePlay2}/>
							</div>
							
							
						))}</div>
				</ModalWindow>
		</div>
	);
}

export default Friends