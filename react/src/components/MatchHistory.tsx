import "./css/matchHistory.css"

const MatchHistory = ( data ) => {
		const history = data.history;
		return(
				<div className="my_table">
				<h1>Match History</h1>
				<table>
					<thead>
						<tr>
						
							<th>Player one</th>
							<th>score</th>
							<th>Player two</th>
							<th>Date</th>
						 
						</tr>
					</thead>
					<tbody>
				{history.map(history => (
				<tr key={history.id}>
				<td><img style={{maxWidth: '40px', maxHeight: '40px', borderRadius: '100%' }} alt="profil-avatar" src={history.userLeft.avatar}></img>{} {history.userLeft.login}</td><td>{history.scoreLeft} - {history.scoreRight}</td><td><img style={{maxWidth: '40px', maxHeight: '40px', borderRadius: '100%' }} src={history.userRight.avatar} alt='indisponible'></img>{} {history.userRight.login}</td><td>{history.date}</td>
				</tr>))}
				</tbody>
				</table>
				</div>
				);
};
export default MatchHistory
