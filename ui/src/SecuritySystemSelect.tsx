import React, {Dispatch, SetStateAction} from 'react';
import {UpdateData} from './ServiceDisplay';
import {Dialog, DialogContent, DialogTitle, List, ListItem, ListItemButton} from "@mui/material";

interface SecuritySystemSelectProps {
    currentState: number;
    updateData: Dispatch<SetStateAction<UpdateData|null>>;
    data: UpdateData|null;
    onClose: () => void;
}

const SecuritySystemSelect: React.FC<SecuritySystemSelectProps> = ({currentState, updateData, onClose, data}) => {

    const onSubmit = (number: number) => {
        if (data !== null) {
            updateData({
                ...data,
                value: number
            });
        }
        onClose();
    }

    return (
        <Dialog open={true} onClose={onClose}>
            <DialogTitle>Security System</DialogTitle>
            <DialogContent>
                <List>
                    <ListItem selected={currentState === 0} disablePadding>
                        <ListItemButton onClick={() => onSubmit(0)}>
                            Home
                        </ListItemButton>
                    </ListItem>
                    <ListItem selected={currentState === 1} disablePadding>
                        <ListItemButton onClick={() => onSubmit(1)}>
                            Away
                        </ListItemButton>
                    </ListItem>
                    <ListItem selected={currentState === 2} disablePadding>
                        <ListItemButton onClick={() => onSubmit(2)}>
                            Night
                        </ListItemButton>
                    </ListItem>
                    <ListItem selected={currentState === 3} disablePadding>
                        <ListItemButton onClick={() => onSubmit(3)}>
                            Off
                        </ListItemButton>
                    </ListItem>
                </List>
            </DialogContent>
        </Dialog>
    );
}

export default SecuritySystemSelect;
