import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";

const NavbarWrapper = () => {
  const location = useLocation();

  // যেসব route এ Navbar দেখাবে না
  const hideNavbarRoutes = ["/dashboard"];

  if (hideNavbarRoutes.includes(location.pathname)) {
    return null;
  }

  return <Navbar />;
};

export default NavbarWrapper;
