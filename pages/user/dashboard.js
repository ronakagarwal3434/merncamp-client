import { useContext, useState, useEffect } from "react";
import { UserContext } from "../../context";
import UserRoute from "../../components/routes/UserRoute";
import PostForm from "../../components/forms/PostForm";
import PostList from "../../components/cards/PostList";
import People from "../../components/cards/People";
import { useRouter } from "next/router";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-toastify";
import { Modal, Pagination } from "antd";
import CommentForm from "../../components/forms/CommentForm";
import Search from "../../components/Search";
import io from "socket.io-client";

const socket = io(
    process.env.NEXT_PUBLIC_SOCKETI0,
    { path: "/socket.io" },
    {
        reconnection: true,
    }
);

const Dashboard = () => {
    const [state, setState] = useContext(UserContext);

    //state
    const [content, setContent] = useState("");
    const [image, setImage] = useState({});
    const [uploading, setUploading] = useState(false);
    //posts
    const [posts, setPosts] = useState({});
    //people
    const [people, setPeople] = useState({});
    //comments
    const [comment, setComment] = useState("");
    const [visible, setVisible] = useState(false);
    const [currentPost, setCurrentPost] = useState({});
    //pagination
    const [totalPosts, setTotalPosts] = useState(0);
    const [page, setPage] = useState(1);

    const router = useRouter();

    useEffect(() => {
        if (state && state.token) {
            newsFeed();
            findPeople();
        }
    }, [state && state.token, page]);

    useEffect(() => {
        try {
            axios.get("/total-posts").then(({ data }) => setTotalPosts(data));
        } catch (err) {
            console.log(err);
        }
    }, [state && state.token]);

    const newsFeed = async (req, res) => {
        try {
            const { data } = await axios.get(`/news-feed/${page}`);
            setPosts(data);
        } catch (err) {
            console.log(err);
        }
    };

    const findPeople = async () => {
        try {
            const { data } = await axios.get("/find-people");
            setPeople(data);
        } catch (err) {
            console.log(err);
        }
    };

    const postSubmit = async (e) => {
        e.preventDefault();
        // console.log("POST => ", content);
        try {
            const { data } = await axios.post("/create-post", {
                content,
                image,
            });
            // console.log("CREATE POST RESPONSE => ", data);
            if (data.error) {
                toast.error(data.error);
            } else {
                setPage(1);
                newsFeed();
                // console.log("fetchUserPosts CHECK !");
                toast.success("Post created!");
                setContent("");
                setImage({});
                socket.emit("new-post", data);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const handleImage = async (e) => {
        const file = e.target.files[0];
        let formData = new FormData();
        formData.append("image", file);
        // console.log([...formData]);
        setUploading(true);
        try {
            const { data } = await axios.post("/upload-image", formData);
            // console.log("UPLOADED IMAGE DATA => ", data);
            setImage({
                url: data.url,
                public_id: data.public_id,
            });
            setUploading(false);
        } catch (err) {
            console.log(err);
            setUploading(false);
        }
    };

    const handleDelete = async (post) => {
        try {
            const answer = window.confirm("Are you sure?");
            if (!answer) return;
            const { data } = await axios.delete(`/delete-post/${post._id}`);
            toast.error("Post Deleted");
            newsFeed();
        } catch (err) {
            console.log(err);
        }
    };

    const handleFollow = async (user) => {
        // console.log("HANDLE FOLLOW => ", user);
        try {
            const { data } = await axios.put("/user-follow", { _id: user._id });
            // console.log("HANDLE FOLLOW RESPONSE => ", data);
            // update local storage - update user , keep token
            let auth = JSON.parse(localStorage.getItem("auth"));
            auth.user = user;
            localStorage.getItem("auth", JSON.stringify(auth));
            // update context
            setState({ ...state, user: user });
            // update people's state
            let filtered = people.filter((p) => p._id !== user._id);
            setPeople(filtered);
            newsFeed();
            toast.success(`Following ${user.name}`);
        } catch (err) {
            console.log(err);
        }
    };

    const handleLike = async (_id) => {
        // console.log("LIKED THE POST => ", _id);
        try {
            const { data } = await axios.put("/like-post", { _id });
            console.log("LIKED DATA => ", data);
            newsFeed();
        } catch (err) {
            console.log(err);
        }
    };

    const handleUnlike = async (_id) => {
        // console.log("UNLIKED THE POST => ", _id);
        try {
            const { data } = await axios.put("/unlike-post", { _id });
            // console.log("UNLIKED DATA => ", data);
            newsFeed();
        } catch (err) {
            console.log(err);
        }
    };

    const handleComment = async (post) => {
        setCurrentPost(post);
        setVisible(true);
    };

    const addComment = async (e) => {
        e.preventDefault();
        // console.log("ADD COMMENT TO THE POST ID => ", currentPost._id);
        // console.log("SAVE COMMENT TO DATABASE => ", comment);
        try {
            const { data } = await axios.put("add-comment", {
                postId: currentPost._id,
                comment,
            });
            // console.log("ADD COMMENT RESPONSE => ", data);
            setComment("");
            setVisible(false);
            newsFeed();
        } catch (err) {
            console.log(err);
        }
    };

    const removeComment = async (postId, comment) => {
        let answer = window.confirm("Are you sure?");
        if (!answer) return;
        try {
            const { data } = await axios.put("/remove-comment", {
                postId,
                comment,
            });
            // console.log("REMOVED COMMENT DATA => ", data);
            newsFeed();
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <UserRoute>
            <div className="container-fluid">
                <div className="row py-5 bg-default-image text-light">
                    <div className="col text-center">
                        <h1>Newsfeed</h1>
                    </div>
                </div>

                <div className="row py-3">
                    <div className="col-md-8">
                        <PostForm
                            content={content}
                            setContent={setContent}
                            postSubmit={postSubmit}
                            handleImage={handleImage}
                            uploading={uploading}
                            image={image}
                        />
                        <br />
                        {/* <pre>{JSON.stringify(posts, null, 4)}</pre> */}

                        <PostList
                            handleDelete={handleDelete}
                            posts={posts}
                            handleLike={handleLike}
                            handleUnlike={handleUnlike}
                            handleComment={handleComment}
                            addComment={addComment}
                            removeComment={removeComment}
                        />

                        <Pagination
                            current={page}
                            total={(totalPosts * 10) / 3}
                            onChange={(value) => console.log(value)}
                            className="pb-5"
                        />
                    </div>

                    <div className="col-md-4">
                        {/* {console.log(state.user.following)} */}
                        <Search />
                        <br />
                        {state && state.user && state.user.following && (
                            <Link href={"/user/following"}>
                                <a className="h6">
                                    {state.user.following.length} Following
                                </a>
                            </Link>
                        )}
                        <People people={people} handleFollow={handleFollow} />
                    </div>
                </div>

                <Modal
                    visible={visible}
                    onCancel={() => setVisible(false)}
                    title="Comments"
                    footer={null}
                >
                    <CommentForm
                        comment={comment}
                        setComment={setComment}
                        addComment={addComment}
                    />
                </Modal>
            </div>
        </UserRoute>
    );
};

export default Dashboard;
