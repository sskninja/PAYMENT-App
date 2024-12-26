import { useEffect, useState } from "react";
import Appbar from "../components/Appbar";
import Balance from "../components/Balance";
import Users from "../components/Users";
import axios from "axios";
import Footer from "../components/Footer";

const Dashboard = () => {
  const [balance, setBalance] = useState(0);
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  useEffect(() => {
    axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/api/v1/account/balance`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      )
      .then((response) => {
        setBalance(response.data.balance.toFixed(2));
        setName(response.data.firstName + " " + response.data.lastName);
        setUserId(response.data.userId);
      });
  });
  return (
    <div>
      <Appbar name={name} />
      <div className="m-8">
        <Balance value={balance} />
        <Users id={userId} />
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
