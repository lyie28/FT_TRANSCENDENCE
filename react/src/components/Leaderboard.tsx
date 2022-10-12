import "./css/matchHistory.css"
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { ModalWindow } from './ModaleWindow/LogiqueModale2';

const Leaderboard = () => {
		const [leader, setLeader] = useState([]);
		const [revele, setRevele] = useState(false);
		const toggleModal = () => {setRevele(!revele);} 

		useEffect(() => {
			axios.get("http://localhost:3000/stats/getLeaderboard", {withCredentials:true}).then((res) =>{
			setLeader(res.data);
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
		
		return(
			<div>
						<button onClick={toggleModal}>Leaderboard</button>
						<ModalWindow revele={revele} setRevele={toggleModal}>
						<div className="my_table">
						<h1>Leaderboard</h1>
						<table>
							<thead>
								<tr>
									<th>Player</th>
									<th>Victories</th>
								</tr>
							</thead>
							<tbody>
						{leader.map(leader => (
						<tr key={leader.id}>
						<td ><img style={{maxWidth: '40px', maxHeight: '40px', borderRadius: '100%' }} alt="profil-avatar" src={leader.avatar}></img>{} {leader.login}</td><td>{leader.total_wins}</td>
						</tr>))}
						</tbody>
						</table>
						</div>
						</ModalWindow>
						</div>
		);
}
export default Leaderboard
