import { useContext } from "react";
import { UserContext } from "../../context";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { SyncOutlined } from "@ant-design/icons";

const UserRoute = ({ children }) => {
    const [ok, setOk] = useState(false);

    const router = useRouter();

    const [state, setState] = useContext(UserContext);

    useEffect(() => {
        if (state && state.token) getCurrentUser();
    }, [state && state.token]);

    const getCurrentUser = async () => {
        try {
            const { data } = await axios.get(`/current-user`);
            if (data.ok) setOk(true);
        } catch (err) {
            router.push("/login");
        }
    };

    process.browser &&
        state === null &&
        setTimeout(() => router.push("/login"), 1000);

    return !ok ? (
        <SyncOutlined
            spin
            className="d-flex justify-content-center display-1 text-primary p-5"
        />
    ) : (
        <> {children} </>
    );
};

export default UserRoute;
