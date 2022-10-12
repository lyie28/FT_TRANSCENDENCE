import axios from "axios";
import {socket} from './Socket';

const AcceptButton = ({FriendReq, setRefresh}) => {
	
const AcceptRequest = event => {
	axios.get("http://localhost:3000/friends/friendRequest/accept/" + FriendReq.id, {withCredentials:true}).then((res) => {
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
	socket.emit('friendrequestnotif', {id: FriendReq.receiverId , new: false});
	alert("Request accepted");
	setRefresh(true);
	}   

	return (
		<button onClick={AcceptRequest}>Accept request</button>
	)
}

export default AcceptButton