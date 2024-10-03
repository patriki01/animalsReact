import React, {ReactElement} from 'react';
import LinkButtons from "./components/LinkButtons";
import {Container} from "@mui/material";

type HomeProps = {
    type: "home" | "animal" | "user",
    children?: ReactElement,
}
function HomePage({children, type}: HomeProps) {
    return (
        <Container>
            <LinkButtons type={type}/>
            {children}
        </Container>

    );
}

export default HomePage;