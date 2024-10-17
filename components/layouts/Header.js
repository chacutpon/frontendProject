import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/userSlice";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { IconButton } from "@mui/material";
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';

const Header = () => {
  const { user } = useSelector((state) => ({ ...state.user }));
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      dispatch(logout());
      navigate("/");
      // alert('are you sure?')  // Consider a less intrusive confirmation, like a modal
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AppBar position="static" color="warning">
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            alignItems: 'center'
          }}
        >
          <IconButton 
            component={Link} 
            to="/" 
            aria-label="homepage" 
            color="inherit"
          >
            Interactive Classroom
          </IconButton>
          
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}> {/* Reduced gap */}
          {user ? (
            <Button 
              color="inherit" 
              onClick={handleLogout} 
              startIcon={<LogoutIcon />} 
              aria-label="Logout"
            >
              Logout
            </Button>
          ) : (
            <Button 
              color="inherit" 
              component={Link} 
              to="/login" 
              startIcon={<LoginIcon />} 
              aria-label="Login"
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;