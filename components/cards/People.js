import { Avatar, List } from "antd";
import moment from "moment";
import { useRouter } from "next/router";
import { UserContext } from "../../context";
import { useContext } from "react";
import { imageSource } from "../../functions";
import Link from "next/link";

const People = ({ people, handleFollow }) => {
    const [state] = useContext(UserContext);

    const router = useRouter();

    return (
        <>
            <List
                itemLayout="horizontal"
                dataSource={Object.entries(people)}
                renderItem={(user) => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={<Avatar src={imageSource(user[1])} />}
                            title={
                                <div className="d-flex justify-content-between">
                                    <Link href={`/user/${user[1].username}`}>
                                        <a>{user[1].username}</a>
                                    </Link>
                                    <span
                                        className="text-primary pointer"
                                        onClick={() => handleFollow(user[1])}
                                    >
                                        Follow
                                    </span>
                                </div>
                            }
                        />
                    </List.Item>
                )}
            />
        </>
    );
};

export default People;
