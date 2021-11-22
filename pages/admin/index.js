import { useContext, useState, useEffect } from "react";
import { UserContext } from "../../context";
import AdminRoute from "../../components/routes/AdminRoute";
import { useRouter } from "next/router";
import axios from "axios";
import renderHTML from "react-render-html";
import { toast } from "react-toastify";

const Admin = () => {
    const [state, setState] = useContext(UserContext);
    const [posts, setPosts] = useState([]);

    const router = useRouter();

    useEffect(() => {
        if (state && state.token) {
            newsFeed();
        }
    }, [state && state.token]);

    const newsFeed = async (req, res) => {
        try {
            const { data } = await axios.get(`/posts`);
            setPosts(data);
        } catch (err) {
            console.log(err);
        }
    };

    const handleDelete = async (post) => {
        try {
            const answer = window.confirm("Are you sure?");
            if (!answer) return;
            const { data } = await axios.delete(
                `/admin/delete-post/${post._id}`
            );
            toast.error("Post Deleted");
            newsFeed();
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <AdminRoute>
            <div className="container-fluid">
                <div className="row py-5 bg-default-image text-light">
                    <div className="col text-center">
                        <h1>ADMIN</h1>
                    </div>
                </div>
                <div className="row py-4">
                    <div className="col-md-8 offset-md-2">
                        {posts &&
                            posts.map((p) => (
                                <div
                                    key={p._id}
                                    className="d-flex justify-content-between"
                                >
                                    <div>{renderHTML(p.content)}</div>
                                    <div
                                        onClick={() => handleDelete(p)}
                                        className="text-danger pointer"
                                    >
                                        Delete
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </AdminRoute>
    );
};

export default Admin;
