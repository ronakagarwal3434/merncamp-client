import { useState, useContext } from "react";
import { UserContext } from "../context";
import axios from "axios";
import { imageSource } from "../functions";
import { Avatar, List } from "antd";
import { toast } from "react-toastify";
import Link from "next/link";

const Search = () => {
    const [state, setState] = useContext(UserContext);

    const [query, setQuery] = useState("");
    const [result, setResult] = useState([]);

    const searchUser = async (e) => {
        e.preventDefault();
        // console.log(`Find ${query} from db`);
        try {
            const { data } = await axios.get(`/search-user/${query}`);
            // console.log("SEARCH USER RESPONSE => ", data);
            setResult(data);
        } catch (err) {
            console.log(err);
        }
    };

    const handleFollow = async (user) => {
        // console.log("add this user to following list ", user);
        try {
            const { data } = await axios.put("/user-follow", { _id: user._id });
            // console.log("handle follow response => ", data);
            // update local storage, update user, keep token
            let auth = JSON.parse(localStorage.getItem("auth"));
            auth.user = data;
            localStorage.setItem("auth", JSON.stringify(auth));
            // update context
            setState({ ...state, user: data });
            // update people state
            let filtered = result.filter((p) => p._id !== user._id);
            setResult(filtered);
            toast.success(`Following ${user.name}`);
        } catch (err) {
            console.log(err);
        }
    };

    const handleUnfollow = async (user) => {
        try {
            const { data } = await axios.put("/user-unfollow", {
                _id: user._id,
            });
            let auth = JSON.parse(localStorage.getItem("auth"));
            auth.user = data;
            localStorage.setItem("auth", JSON.stringify(auth));
            // update context
            setState({ ...state, user: data });
            // update people state
            let filtered = result.filter((p) => p._id !== user._id);
            setResult(filtered);
            toast.error(`Unfollowed ${user.name}`);
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <>
            <form className="form-inline row" onSubmit={searchUser}>
                <div className="col-8">
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setResult([]);
                        }}
                        className="form-control"
                        placeholder="Search"
                    />
                </div>
                <div className="col-4">
                    <button
                        className="btn btn-outline-primary col-12"
                        type="submit"
                    >
                        Search
                    </button>
                </div>
            </form>
            {result && result.length > 0 && (
                <List
                    itemLayout="horizontal"
                    dataSource={result}
                    renderItem={(user) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<Avatar src={imageSource(user)} />}
                                title={
                                    <div className="d-flex justify-content-between">
                                        <Link href={`/user/${user.username}`}>
                                            <a>{user.username}</a>
                                        </Link>
                                        {state &&
                                        state.user &&
                                        user.followers &&
                                        user.followers.includes(
                                            state.user._id
                                        ) ? (
                                            <span
                                                className="text-primary pointer"
                                                onClick={() =>
                                                    handleUnfollow(user)
                                                }
                                            >
                                                Unfollow
                                            </span>
                                        ) : (
                                            <span
                                                className="text-primary pointer"
                                                onClick={() =>
                                                    handleFollow(user)
                                                }
                                            >
                                                Follow
                                            </span>
                                        )}
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
            )}
        </>
    );
};

export default Search;
