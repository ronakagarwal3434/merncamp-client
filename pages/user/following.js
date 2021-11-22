import { Avatar, List } from "antd";
import moment from "moment";
import { useRouter } from "next/router";
import { UserContext } from "../../context";
import { useContext, useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { RollbackOutlined } from "@ant-design/icons";

const Following = () => {
    const [state, setState] = useContext(UserContext);
    const [people, setPeople] = useState([]);

    const router = useRouter();

    useEffect(() => {
        if (state && state.token) fetchFollowing();
    }, [state && state.token]);

    const imageSource = (user) => {
        if (user.image) return user.image.url;
        else {
            return "/images/logo.png";
        }
    };

    const fetchFollowing = async () => {
        try {
            const { data } = await axios.get("/user-following");
            // console.log("FETCH FOLLOWING => ", data);
            setPeople(data);
        } catch (err) {
            console.log(err);
        }
    };

    const handleUnfollow = async (user) => {
        try {
            const { data } = await axios.put("/user-unfollow", {
                _id: user._id,
            });
            // console.log("HANDLE UNFOLLOW RESPONSE => ", data);
            // update local storage - update user , keep token
            let auth = JSON.parse(localStorage.getItem("auth"));
            auth.user = user;
            localStorage.getItem("auth", JSON.stringify(auth));
            // update context
            setState({ ...state, user: user });
            // update people's state
            let filtered = people.filter((p) => p._id !== user._id);
            setPeople(filtered);
            toast.error(`Unfollowed ${user.name}`);
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <>
            <div className="row col-md-6 offset-md-3">
                <List
                    itemLayout="horizontal"
                    dataSource={people}
                    renderItem={(user) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<Avatar src={imageSource(user)} />}
                                title={
                                    <div className="d-flex justify-content-between">
                                        {user.username}{" "}
                                        <span
                                            className="text-primary pointer"
                                            onClick={() => handleUnfollow(user)}
                                        >
                                            Unfollow
                                        </span>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
                <Link href={"/user/dashboard"}>
                    <a className="d-flex justify-content-center pt-5 h2">
                        <RollbackOutlined />
                    </a>
                </Link>
            </div>
        </>
    );
};

export default Following;
