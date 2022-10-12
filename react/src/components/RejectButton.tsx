import axios from "axios";
import {socket} from './Socket';

const RejectButton = ({FriendReq, setRefresh}) => {
	const RejectRequest = event => {
		axios.get("http://localhost:3000/friends/friendRequest/reject/" + FriendReq.id, {withCredentials:true}).then((res) => {
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
		socket.emit('friendrequestnotif', {id: FriendReq.receiverId , new: false});
		alert("Request Rejected");
		setRefresh(true);
	}	   

	return (<button onClick={RejectRequest}>Reject request</button>)
}

export default RejectButton