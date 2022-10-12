/* Manon */
import React from "react";
import './css/globalStyle.css'

const logo= {
    display: "flex",
    alignItems: "center",
    flexDirection: "row" as "row"
}

const img= {
    width: "32px",
    marginRight: "8px",
}

const h3= {
    margin: "auto", 
    color: "#FBCB0A"
}

const Logo = () => {
    return (
        <div style={logo}>
            <img style={img} src="./pong.png" alt="logo pong" />
            <h3 style={h3}>Pong</h3>
        </div>
    )
}
export default Logo