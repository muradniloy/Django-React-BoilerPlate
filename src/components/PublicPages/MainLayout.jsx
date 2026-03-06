import { Outlet } from "react-router-dom";
import NavbarWrapper from "./NavWrapper";

const MainLayout = () => {
  return (
    <>
      <NavbarWrapper />
      <div>
        <Outlet />
      </div>
    </>
  );
};

export default MainLayout;
