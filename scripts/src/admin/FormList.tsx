/// <reference path="./admin.d.ts"/>
import * as React from 'react';
import axios from 'axios';
import FormPage from "../form/FormPage";

class FormList extends React.Component<IFormListProps, IFormListState> {
    constructor(props:any) {
        super(props);
        this.render = this.render.bind(this);
        this.state = {
        }
    }
    showEmbedCode(formId) {
        
    }
    render() {
        return (
        <table className="table">
        <thead>
            <tr>
                <td>Form name</td>
                <td>Actions</td>
            </tr>
        </thead>
        <tbody>
            {this.props.formList.map((form) => 
                <tr key={form["id"]} style = {{outline: 'thin solid'}}>
                    <td>{form["name"]}</td>
                    <td>
                        <button className="btn btn-primary" onClick = {() => this.props.embedForm(form)}>Embed</button>
                        <button className="btn" onClick = {() => this.props.editForm(form)}>Edit</button>
                        <button className="btn" onClick = {() => this.props.loadResponses(form)}>View Responses</button>
                    </td>
                </tr>
            )}
        </tbody>
        </table>
        )
    }
}
export default FormList;