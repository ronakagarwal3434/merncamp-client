import { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Link from "next/link";
import AuthForm from "../components/forms/AuthForm";
import { useRouter } from "next/router";
import { UserContext } from "../context";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const [state, setState] = useContext(UserContext);

    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        // console.log(name, email, password, secret);
        try {
            setLoading(true);
            const { data } = await axios.post(`/login`, {
                email,
                password,
            });
            if (data.error) {
                toast.error(data.error);
                setLoading(false);
            } else {
                // update context
                setState({
                    user: data.user,
                    token: data.token,
                });
                // save in local storage
                window.localStorage.setItem("auth", JSON.stringify(data));
                router.push("/user/dashboard");
            }
        } catch (err) {
            toast.error(err.response.data);
            setLoading(false);
        }
    };

    if (state && state.token) router.push("/user/dashboard");

    return (
        <div className="container-fluid">
            <div className="row py-5 bg-default-image text-light">
                <div className="col text-center">
                    <h1>Login</h1>
                </div>
            </div>

            <div className="row py-5">
                <div className="col-md-6 offset-md-3">
                    <AuthForm
                        handleSubmit={handleSubmit}
                        email={email}
                        setEmail={setEmail}
                        password={password}
                        setPassword={setPassword}
                        loading={loading}
                        page="login"
                    />
                </div>
            </div>

            <div className="row">
                <div className="col">
                    <p className="text-center">
                        Not Yet Registerd?{" "}
                        <Link href="/register">
                            <a>Register</a>
                        </Link>
                    </p>
                </div>
            </div>

            <div className="row">
                <div className="col">
                    <p className="text-center">
                        <Link href="/forgot-password">
                            <a className="text-danger">Forgot Password?</a>
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
