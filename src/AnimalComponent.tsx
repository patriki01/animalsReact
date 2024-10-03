import React, {useState} from 'react';
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import axios from "axios";
import {
    Alert,
    Box,
    Button,
    Container, Dialog, DialogContent, DialogTitle, FormControl, FormHelperText,
    IconButton, InputLabel, MenuItem,
    Paper, Select, Snackbar,
    Table, TableBody, TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
} from "@mui/material";
import {Add, Clear, Edit, PlusOne} from "@mui/icons-material";
import {Animal, EditAnimal, SimpleAnimal} from "./types";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import SearchField from "./components/SearchField";

const animalSchema = z.object({
    name: z.string().min(3, "Name has to be longer."),
    type: z.enum(['cat', 'dog', 'other']),
    age: z.coerce.number().positive()
})
function AnimalComponent() {
    const [openAdder, setOpenAdder] = useState(false);
    const [openSnack, setOpenSnack] = useState(false);
    const [snackMessage, setSnackMessage] = useState("");
    const [search, setSearch] = useState("");
    const [editing, setEditing] = useState(false);
    const [id, setId] = useState<string>("");
    const {register, handleSubmit, reset, control,
        formState: { errors }} = useForm<Animal>({resolver: zodResolver(animalSchema)});
    const queryClient = useQueryClient();
    const getAnimals = useQuery({queryKey: ["animals"],
        queryFn: () => axios.get<Animal[]>("/animals")})
    const createAnimal = useMutation({
        mutationFn: (animal: SimpleAnimal) => axios.post<SimpleAnimal>("/animals", animal),
        onSuccess: () =>
            queryClient.invalidateQueries({queryKey: ["animals"]}).then(_ => setOpenSnack(true))
        });
    const editAnimal = useMutation({
        mutationFn: (animal: EditAnimal) => axios.patch<Animal>(`animals/${animal.id}`, animal),
        onSuccess: () =>
            queryClient.invalidateQueries({queryKey: ["animals"]}).then(_ => setOpenSnack(true))
        });
    const clearForm = () => reset({name: "", type: undefined, age: undefined});
    const onSubmit = (data: SimpleAnimal) => {
        setOpenAdder(false);
        if (editing) {
            editAnimal.mutate({id: id, type: data.type, name: data.name, age: data.age});
            setSnackMessage("Animal edited successfully!")
            setEditing(false);
        } else {
            createAnimal.mutate(data);
            setSnackMessage("Animal added successfully!")
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
                    Add animal
                </Button>
            </Container>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell align="center">Type</TableCell>
                            <TableCell align="center">Age</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {getAnimals.data?.data
                            .filter((animal) => animal.name.toLowerCase().includes(search.toLowerCase()))
                            .sort((a, b)=>a.name.localeCompare(b.name))
                            .map((animal) => (
                                <TableRow
                                    key={animal.id}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row">{animal.name}</TableCell>
                                    <TableCell align="center">{animal.type}</TableCell>
                                    <TableCell align="center">{animal.age}</TableCell>
                                    <TableCell align="right">
                                        <IconButton children={<Edit />} onClick={() => {
                                            setEditing(true);
                                            setId(animal.id);
                                            reset(animal);
                                            setOpenAdder(true);
                                        }}/>
                                        <IconButton children={<PlusOne/>}
                                                    onClick={() => {
                                                        editAnimal.mutate({id: animal.id, age: animal.age + 1});
                                                        setSnackMessage("Age incremented!")
                                        }}
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
                <DialogTitle>{editing ? "Edit animal" : "Add animal"}</DialogTitle>
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
                            <InputLabel id="typeLabel">Type</InputLabel>
                            <Controller name="type" defaultValue={undefined} control={control} render={({field}) =>
                                <Select
                                    margin="dense"
                                    {...field}
                                    labelId="typeLabel"
                                    label="Type"
                                    error={!!errors.type}
                                    value={field.value || ""}
                                    onChange={(e) => field.onChange(e.target.value || undefined)}
                                >
                                    <MenuItem value=""><em>Select type</em></MenuItem>
                                    <MenuItem value="dog">Dog</MenuItem>
                                    <MenuItem value="cat">Cat</MenuItem>
                                    <MenuItem value="other">Other</MenuItem>
                                </Select>}
                            />
                            {errors.type && <FormHelperText>Type has to be selected</FormHelperText>}
                        </FormControl>
                        <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="end" sx={{marginTop: "8px"}} >
                            <Box sx={{flexDirection: "column"}}>
                                <TextField inputProps={{type: "number"}} {...register('age')} label="Age"
                                           required error={!!errors.age} sx={{maxWidth: "6rem"}}/>
                                {errors.age && <FormHelperText sx={{color: "red"}}>Age has to be positive number</FormHelperText>}
                            </Box>
                            <Button variant="contained" type="submit" sx={{height: "40px"}}>
                                {editing ? "Edit animal" : "Add animal"}
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

export default AnimalComponent;