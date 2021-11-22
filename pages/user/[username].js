import { Avatar, Card } from "antd";
import { useRouter } from "next/router";
import { UserContext } from "../../context";
import { useContext, useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { RollbackOutlined } from "@ant-design/icons";
import moment from "moment";

const { Meta } = Card;

const Username = () => {
    const [state, setState] = useContext(UserContext);
    const [user, setUser] = useState({});

    const router = useRouter();

    useEffect(() => {
        if (router.query.username) fetchUser();
    }, [router.query.username]);

    const imageSource = (user) => {
        if (user.image) return user.image.url;
        else {
            return "/images/logo.png";
        }
    };

    const fetchUser = async () => {
        try {
            const { data } = await axios.get(`/user/${router.query.username}`);
            setUser(data);
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <>
            <div className="row col-md-6 offset-md-3">
                <div className="pt-5 pb-5">
                    <Card
                        hoverable
                        cover={<img src={imageSource(user)} alt={user.name} />}
                    >
                        <Meta title={user.name} description={user.about} />
                        <p className="pt-2 text-muted">
                            Joined {moment(user.createdAt).fromNow()}
                        </p>
                        <div className="d-flex justify-content-between">
                            <span className="btn btn-sm">
                                {user.followers && user.followers.length}{" "}
                                Followers
                            </span>
                            <span className="btn btn-sm">
                                {user.following && user.following.length}{" "}
                                Following
                            </span>
                        </div>
                    </Card>
                    <Link href={"/user/dashboard"}>
                        <a className="d-flex justify-content-center pt-5 h2">
                            <RollbackOutlined />
                        </a>
                    </Link>
                </div>
            </div>
        </>
    );
};

export default Username;
