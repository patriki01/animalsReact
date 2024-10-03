import React from 'react';
import {IconButton, TextField} from "@mui/material";
import {Clear} from "@mui/icons-material";

type SearchFieldProps = {
    search: string,
    setSearch: React.Dispatch<React.SetStateAction<string>>,
}

function SearchField({search, setSearch}: SearchFieldProps) {
    return (
        <span>
            <TextField label="Filter name" variant="outlined" value={search}
                onChange={(event) => setSearch(event.target.value)}
            />
            {search && <IconButton onClick={() => setSearch("")} children={<Clear/>}
                                   sx={{height: "56px", width: "56px", marginLeft: "8px"}}/>}
        </span>
    );
}

export default SearchField;