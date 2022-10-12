/*sam*/

import {socket} from './Socket';
import CSS from 'csstype';
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
	transform: 'translate(-50%, -50%)'
}
const chatTitle1 = {
	display: "flex",
	justifyContent: "center",
	marginTop: "auto", 
	position: "absolute",
	padding: '16px',

	top:"70%", 
	left: "38%",
   } as React.CSSProperties;

   const chatTitle2 = {
	display: "flex",
	justifyContent: "center",
	marginTop: "auto",
	padding: '16px',
	position: "absolute",
	top:"70%", 
	left: "52%",
   } as React.CSSProperties;

const Defeat = ( {toggle, revele, opponent, actual, version} ) => {
	let v = '';
	if (version === 0)
		v = 'pong';
	else
		v = ' smash pong';
	const accept = () => {
		socket.emit('acceptMatch', opponent, actual, version)
		toggle();
	}

	const reject = () => {
		socket.emit('rejectMatch', opponent, actual, version)
		toggle();
	}

	if(revele) {
		return(
			
			<div>
			<div style={background} />
				<div style={modale}>
			<h1 style={{textAlign:'center'}}>{opponent.login} defeat you to {v}</h1>    
			
			<div style={{textAlign:'center', marginTop:'100px'}}> <img style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '100%' }} alt='profilImage' src={opponent.avatar} />
			<b> VS </b><img style={{maxWidth: '100px', maxHeight: '100px', borderRadius: '100%' }} alt='profilImage' src={actual.avatar} />
			</div>
			<button style={chatTitle1} onClick={accept}>Accept</button>
			<button style={chatTitle2} onClick={reject}>Reject</button>
		</div>
		</div>
			);
		}
		else
			return null;
};
export default Defeat