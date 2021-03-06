import React from "react";
import { connect } from "react-redux";
import "./Login.scss";
import CustomForm from "../../form/CustomForm";
import {
  checkLoginStatus,
  logout,
  handleAuthStateChange,
  signIn,
  signUp,
  forgotPassword,
  forgotPasswordSubmit
} from "../../store/auth/actions";
// import { withFederated } from "aws-amplify-react/dist/Auth";
import AuthPageNavButton from "./AuthPageNavButton";
import { IAuthState } from "../../store/auth/types";
import { setLoginUrl } from "../../store/auth/actions";

const mapStateToProps = state => ({
  ...state.auth
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  checkLoginStatus: () => dispatch(checkLoginStatus()),
  logout: () => dispatch(logout()),
  handleAuthStateChange: (state, data) =>
    dispatch(handleAuthStateChange(state, data)),
  signIn: data => dispatch(signIn(data)),
  signUp: data => dispatch(signUp(data)),
  forgotPassword: data => dispatch(forgotPassword(data)),
  forgotPasswordSubmit: data => dispatch(forgotPasswordSubmit(data)),
  setLoginUrl: url => dispatch(setLoginUrl(url))
});

const Buttons = props => (
  <div>
    <button className="btn btn-primary" onClick={props.googleSignIn}>
      <img
        style={{ width: 16 }}
        className="mr-4"
        src={
          "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjU3cHgiIGhlaWdodD0iNThweCIgdmlld0JveD0iMCAwIDU3IDU4IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbG5zOnNrZXRjaD0iaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zIj4KICAgIDwhLS0gR2VuZXJhdG9yOiBTa2V0Y2ggMy40ICgxNTU4OCkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+CiAgICA8dGl0bGU+Z29vZ2xlPC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGRlZnM+PC9kZWZzPgogICAgPGcgaWQ9IlBhZ2UtMSIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCIgc2tldGNoOnR5cGU9Ik1TUGFnZSI+CiAgICAgICAgPGcgaWQ9Imdvb2dsZSIgc2tldGNoOnR5cGU9Ik1TTGF5ZXJHcm91cCIgZmlsbD0iI0ZGRkZGRiI+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0yOS4wMDQsMzQuNDE0IEwyOS4wMDQsMjMuODEyIEw1NS42OCwyMy44MTIgQzU2LjA4LDI1LjYwOCA1Ni4zOTIsMjcuMjg4IDU2LjM5MiwyOS42NTQgQzU2LjM5Miw0NS45MjggNDUuNDc2LDU3LjQ5OCAyOS4wMzIsNTcuNDk4IEMxMy4zLDU3LjQ5OCAwLjUzMiw0NC43MyAwLjUzMiwyOC45OTggQzAuNTMyLDEzLjI2NiAxMy4zLDAuNDk4IDI5LjAzMiwwLjQ5OCBDMzYuNzI4LDAuNDk4IDQzLjE2OCwzLjMyIDQ4LjA5OCw3LjkzNiBMNDAuMDA0LDE1LjgwMiBDMzcuOTUyLDEzLjg2NCAzNC4zNiwxMS41ODQgMjkuMDMyLDExLjU4NCBDMTkuNTk4LDExLjU4NCAxMS45MDQsMTkuNDIyIDExLjkwNCwyOS4wMjYgQzExLjkwNCwzOC42MyAxOS42LDQ2LjQ2OCAyOS4wMzIsNDYuNDY4IEMzOS45NDgsNDYuNDY4IDQzLjk2NiwzOC45MTYgNDQuNzA2LDM0LjQ0IEwyOS4wMDIsMzQuNDQgTDI5LjAwMiwzNC40MTIgTDI5LjAwNCwzNC40MTQgWiIgaWQ9IlNoYXBlIiBza2V0Y2g6dHlwZT0iTVNTaGFwZUdyb3VwIj48L3BhdGg+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4="
        }
      />
      Sign in / Sign up with Google
    </button>
  </div>
);
const federated = {
  google_client_id:
    "766882331202-ccnggd9cf0h54h9k5nn6ouqhgmeesrju.apps.googleusercontent.com",
  facebook_app_id: "",
  amazon_client_id: ""
};
// const Federated = withFederated(Buttons);

const errorMessageMap = message => {
  if (/User does not exist/i.test(message)) {
    return "User does not exist!";
  }

  return message;
};

interface ILoginProps extends IAuthState {
  checkLoginStatus: () => void;
  logout: () => void;
  handleAuthStateChange: (a, b) => void;
  setup: () => void;
  signIn: (e) => void;
  signUp: (e) => void;
  forgotPassword: (e) => void;
  forgotPasswordSubmit: (e) => void;
  setLoginUrl: (e: string) => void;
  loginOptional?: boolean;
  hideBar?: boolean;
  linkToHome?: boolean;
}
class Login extends React.Component<ILoginProps, {}> {
  componentDidMount() {
    window.parent.postMessage({ action: "login_loaded" }, "*");
    window.addEventListener("message", e => this.receiveMessage(e));
    this.props.checkLoginStatus();
  }

  componentWillUnmount() {
    window.removeEventListener("message", e => this.receiveMessage(e));
  }
  componentDidUpdate(prevProps: ILoginProps) {
    if (
      prevProps.authPage !== this.props.authPage ||
      prevProps.error !== this.props.error ||
      prevProps.message !== this.props.message
    ) {
      window.parent.postMessage(
        { ccmt_login_height: document.body.scrollHeight },
        "*"
      );
    }
    if (prevProps.authPage !== this.props.authPage) {
      window.parent.postMessage(
        {
          ccmt_auth_page: this.props.authPage,
          ccmt_login_error: this.props.error,
          ccmt_login_message: this.props.message
        },
        "*"
      );
    }
    if (prevProps.loggedIn !== this.props.loggedIn) {
      window.parent.postMessage({ ccmt_logged_in: this.props.loggedIn }, "*");
    }
  }

  receiveMessage(event) {
    if (event.data.jwt) {
      let jwt = event.data.jwt;
      if (
        !jwt ||
        typeof jwt !== "string" ||
        jwt === localStorage.getItem("jwt")
      ) {
        return;
      }
      localStorage.setItem("jwt", jwt);
      this.props.checkLoginStatus();
    }
    if (event.data.loginUrl) {
      this.props.setLoginUrl(event.data.loginUrl);
    }
  }

  render() {
    if (!this.props.loggedIn) {
      if (this.props.loginOptional) {
        // This is used, for example, on anonymous forms, so that the form is still aware of the user id of a logged-in user (such as an admin) if the admin is logged in.
        // TODO: return just a small login button.
        return null;
      }
      return (
        <div className="cff-login">
          {this.props.message && (
            <div className="alert alert-info" role="alert">
              {this.props.message}
            </div>
          )}
          {this.props.error && (
            <div className="alert alert-danger" role="alert">
              {this.props.error}
            </div>
          )}
          {this.props.authPage == "signIn" && (
            <CustomForm
              schema={this.props.schemas.signIn.schema}
              uiSchema={this.props.schemas.signIn.uiSchema}
              onSubmit={e => this.props.signIn(e.formData)}
            />
          )}
          {this.props.authPage == "signUp" && (
            <CustomForm
              schema={this.props.schemas.signUp.schema}
              uiSchema={this.props.schemas.signUp.uiSchema}
              onSubmit={e => this.props.signUp(e.formData)}
            />
          )}
          {this.props.authPage == "forgotPassword" && (
            <CustomForm
              schema={this.props.schemas.forgotPassword.schema}
              uiSchema={this.props.schemas.forgotPassword.uiSchema}
              onSubmit={e => this.props.forgotPassword(e.formData)}
            />
          )}
          {this.props.authPage == "forgotPasswordSubmit" && (
            <CustomForm
              schema={this.props.schemas.forgotPasswordSubmit.schema}
              uiSchema={this.props.schemas.forgotPasswordSubmit.uiSchema}
              onSubmit={e => this.props.forgotPasswordSubmit(e.formData)}
            />
          )}
          <div className="mt-4">
            <AuthPageNavButton
              current={this.props.authPage}
              page="signIn"
              label="Sign In"
            />
            <AuthPageNavButton
              current={this.props.authPage}
              page="signUp"
              label="Sign Up"
            />
            <AuthPageNavButton
              current={this.props.authPage}
              page="forgotPassword"
              label="Forgot Password"
            />
          </div>
        </div>
      );
    } else {
      if (this.props.hideBar) {
        return null;
      }
      const Logo = () => (
        <img
          src={require("../../img/logo.png")}
          style={{ height: 40, marginRight: 20 }}
        />
      );
      return (
        <div className="text-left">
          <a>
            {" "}
            {this.props.linkToHome ? (
              <a href="/">
                <Logo />
              </a>
            ) : (
              <Logo />
            )}
          </a>
          <div style={{ display: "inline-block", verticalAlign: "middle" }}>
            {/* <strong>Chinmaya Forms Framework</strong><br /> */}
            Welcome, {this.props.user.email}
          </div>
          <div className="d-none">
            <br />
            <br />
            User ID: {this.props.userId}
          </div>
          <div className="float-right">
            <button className="btn" onClick={() => this.props.logout()}>
              Logout
            </button>
          </div>
        </div>
      );
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
