import React from 'react';
import {Button, Container} from "@mui/material";
import {Link} from "react-router-dom";
import {People, Pets} from "@mui/icons-material";

type LinkButtonProps = {
    type: "home" | "animal" | "user"
}

function LinkButtons({type}: LinkButtonProps) {
    return (
        <Container  sx={{display: "flex", justifyContent: "center", margin: "1rem"}}>
            <Link to="/users"><Button size="large" variant={type === "user" ? "contained" : "outlined"} endIcon={<People/>}>Users</Button></Link>
            <Link to="/animals"><Button size="large" variant={type === "animal" ? "contained" : "outlined"} endIcon={<Pets/>}>Animals</Button></Link>
        </Container>
    );
}

export default LinkButtons;