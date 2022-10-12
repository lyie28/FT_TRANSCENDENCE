/* aurel */
import CSS from 'csstype';
import MaterialIcon from 'material-icons-react';

const modaleWindow: CSS.Properties = {
    // boxShadow: ' inset 0px 0px 10px 20px rgba(204, 95, 117)',
    borderRadius: "1%",
    height: '500px',
    width: '700px',
    background: 'white',
    position: 'absolute',
    top: '50%',
    left: '50%',
    zIndex: '9999',
    transform: 'translate(-50%, -50%)',
    padding: '16px'
}

const modaleSide: CSS.Properties = {
    display: 'flex',
    flexDirection: 'column',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'grey',
    width: '250px',
    zIndex: '9999'
  }

const background: CSS.Properties = {
    background: 'rgba(0,0,0,0.5)',
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    zIndex: '9998'
}
const button: CSS.Properties = {
    position: 'absolute',
    right: '15px',
    top: '15px'
}



/* Les fonction Mondal[style] permet d'afficher les elements children sous forme de modale 
** (en fonction de l'etat de du param revele) */
export function ModalWindow({children, revele, setRevele}) {

    if (revele) {
        return (
            <div>
            <div style={background} />
            <div className="modal" style={modaleWindow}>
                <button className="closeButton"><div style={button}><MaterialIcon title="Close" icon="close" onClick={setRevele} /></div></button>
                {children}
            </div>
            </div>
        );
    }
    return (
        <></>
    )
}
/* Differentes declinaison style de modale */
export function ModalSide({children, revele, setRevele}) {

    if (revele) {
        return (
            <div className="modal" style={modaleSide}>
                {children}
            </div>
        );
    }
    return (
        <></>
    )
}