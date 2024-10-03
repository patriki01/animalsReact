import React, {useState} from 'react';
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import axios from "axios";
import {
    Alert,
    Box,
    Button,
    Container,
    Dialog,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel, FormHelperText,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select, Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField
} from "@mui/material";
import {Female, Male, Edit, QuestionMark, Gavel, Add} from '@mui/icons-material';
import {EditUser, SimpleUser, User} from "./types";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import SearchField from "./components/SearchField";

const userSchema = z.object({
    name: z.string().min(3, "Name is required."),
    gender: z.enum(['male', 'female', 'other']),
    banned: z.boolean()
})

function UserComponent() {
    const [openAdder, setOpenAdder] = useState(false);
    const [openSnack, setOpenSnack] = useState(false);
    const [snackMessage, setSnackMessage] = useState("");
    const [search, setSearch] = useState("");
    const [editing, setEditing] = useState(false);
    const [id, setId] = useState<string>("");
    const {register, handleSubmit, reset, control,
        formState: { errors }} = useForm<User>({resolver: zodResolver(userSchema)});
    const queryClient = useQueryClient();
    const getUsers = useQuery({queryKey: ["users"],
        queryFn: () => axios.get<User[]>("/users")})
    const createUser = useMutation({
        mutationFn: (user: SimpleUser) => axios.post<SimpleUser>("/users", user),
        onSuccess: () =>
            queryClient.invalidateQueries({queryKey: ["users"]}).then(_ => setOpenSnack(true))
        });
    const editUser = useMutation({
        mutationFn: (user: EditUser) => axios.patch<User>(`users/${user.id}`, user),
        onSuccess: () =>
            queryClient.invalidateQueries({queryKey: ["users"]}).then(_ => setOpenSnack(true))
        });
    const clearForm = () => reset({name: "", gender: undefined, banned: false});
    const onSubmit = (data: SimpleUser) => {
        setOpenAdder(false);
        if (editing) {
            editUser.mutate({id: id, banned: data.banned, name: data.name, gender: data.gender});
            setSnackMessage("User edited successfully!")
            setEditing(false);
        } else {
            createUser.mutate(data);
            setSnackMessage("User added successfully!")
        }
        clearForm();
    }
    return (
        <Container>
            <Container   sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                alignContent: "center",
                marginBottom: "1rem"
            }}>
                <SearchField search={search}  setSearch={setSearch}/>

                <Button variant="outlined" endIcon={<Add/>} sx={{height: "45px"}} onClick={() => {
                    setOpenAdder(true);
                    reset();
                }}>
                    Add user
                </Button>
            </Container>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell align="center">Gender</TableCell>
                            <TableCell align="center">Banned</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {getUsers.data?.data
                            .filter((user) => user.name.toLowerCase().includes(search.toLowerCase()))
                            .sort((a, b)=>a.name.localeCompare(b.name))
                            .map((user) => (
                            <TableRow
                                key={user.id}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row">{user.name}</TableCell>
                                <TableCell align="center">{user.gender === "male" ? <Male/> : user.gender === "female" ? <Female/> : <QuestionMark/>}</TableCell>
                                <TableCell align="center">{user.banned ? "banned" : "innocent"}</TableCell>
                                <TableCell align="right">
                                    <IconButton children={<Edit />} onClick={() => {
                                        setEditing(true);
                                        setId(user.id);
                                        reset(user);
                                        setOpenAdder(true);
                                    }}/>
                                    <IconButton children={<Gavel/>} sx={{color: user.banned ? "red" : ""}}
                                                onClick={() => {
                                                    editUser.mutate({id: user.id, banned: !user.banned});
                                                    setSnackMessage("Ban status changed!")
                                                }

                                    }
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openAdder} onClose={() => {
                clearForm();
                setOpenAdder(false);
                setEditing(false);
            }}>
                <DialogTitle>{editing ? "Edit user" : "Add user"}</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <TextField
                            required
                            margin="normal"
                            id="name"
                            label="Name"
                            fullWidth
                            error={!!errors.name}
                            helperText={errors.name ? errors.name.message : ''}
                            {...register('name', { required: true })}
                        />
                        <FormControl fullWidth required>
                            <InputLabel id="genderLabel">Gender</InputLabel>
                                <Controller name="gender" defaultValue={undefined} control={control} render={({field}) =>
                                    <Select
                                    {...field}
                                    labelId="genderLabel"
                                    label="Gender"
                                    error={!!errors.gender}
                                    value={field.value || ""}
                                    onChange={(e) => field.onChange(e.target.value || undefined)}
                                    >
                                        <MenuItem value=""><em>Select Gender</em></MenuItem>
                                        <MenuItem value="male">Male <Male/></MenuItem>
                                        <MenuItem value="female">Female <Female/></MenuItem>
                                        <MenuItem value="other">Other</MenuItem>
                                    </Select>}
                                />
                            {errors.gender && <FormHelperText>Gender has to be selected</FormHelperText>}
                        </FormControl>
                        <Box display="flex" flexDirection="row" justifyContent="space-between" sx={{marginTop: "8px", marginLeft: "8px"}}>
                            <FormControlLabel control={<input type="checkbox" {...register('banned')}/>} label="Banned" />
                            <Button variant="contained" type="submit">
                                {editing ? "Edit user" : "Add user"}
                            </Button>
                        </Box>
                    </form>

                </DialogContent>
            </Dialog>
            <Snackbar open={openSnack}
                onClose={() => setOpenSnack(false)}
                autoHideDuration={3000}
            >
                <Alert onClose={() => setOpenSnack(false)} severity="success">
                    {snackMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default UserComponent;