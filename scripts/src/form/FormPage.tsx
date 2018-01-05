/// <reference path="./interfaces.d.ts"/>
import * as React from 'react';
import Linkify from 'react-linkify';
import Form from 'react-jsonschema-form'; 
import SchemaField from "react-jsonschema-form";
import TitleField from "react-jsonschema-form";
import DescriptionField from "react-jsonschema-form";
import BooleanField from 'react-jsonschema-form';
import * as DOMPurify from 'dompurify';
import * as deref from "json-schema-deref-sync";
import * as Promise from 'bluebird';
import axios from 'axios';import "./form.css";
import FormConfirmationPage from "./FormConfirmationPage";

const STATUS_FORM_LOADING = 0;
const STATUS_FORM_RENDERED = 2;
const STATUS_FORM_SUBMITTED = 4;

/* Custom object field template that allows for grid classes to be specified.
 * If no className is given in schema modifier, defaults to "col-12".
 */
function ObjectFieldTemplate({ TitleField, properties, title, description }) {
  return (
    <div className="container-fluid p-0">
      <TitleField title={title} />
      <div dangerouslySetInnerHTML={{"__html": DOMPurify.sanitize(description)}} />
      <div className="row">
        {properties.map(prop => {
          if (prop.content.props.uiSchema.classNames == "twoColumn") {
             prop.content.props.uiSchema.classNames = "col-12 col-sm-6";
          }
          if (!prop.content.props.uiSchema.classNames) {
            prop.content.props.uiSchema.classNames = "col-12";
          }
          return (prop.content);
        })}
      </div>
    </div>
  );
}

/* Adds a custom error message for regex validation (especially for phone numbers).
 */
function transformErrors(errors) {
  return errors.map(error => {
    if (error.name === "pattern") {
      error.message = "Please enter a value in the correct format."
    }
    return error;
  });
}


const PhoneWidget = (props: any) => {
  return (
    <input
      type="tel"
      className="inputPhone"
      value={props.value}
      required={props.required}
      onChange={(event) => props.onChange(event.target.value)}
    />
  );
};

const TCWidget = (props: any) => {
  return (
    <div>
      <div>I agree to the <a target="_blank" href={props.link}>Terms and Conditions</a>.</div>
      <input
        type="checkbox"
        value={props.value}
        required={props.required}
        onChange={(event) => props.onChange(event.target.value)}
      />
    </div>
  );
};


const FormattedDescriptionField = ({id, description}) => {
  return <div id={id}>
    <div dangerouslySetInnerHTML={{"__html": DOMPurify.sanitize(description)}} />
  </div>;
};

const CustomBooleanField = (props => {
  console.log("p", props);
  return (<div>
    <FormattedDescriptionField id={props.description} description={props.description} />
    <BooleanField {...props} />
  </div>);
})

const CustomTitleField = ({title, required}) => {
  const legend = required ? title + '*' : title;
  return <h2 className="ccmt-cff-form-title">
    {legend && legend.replace(/\b[a-z]/g, l => l.toUpperCase())}
  </h2>;
};


const widgets = {
  phone: PhoneWidget,
  "tc": TCWidget
};

const fields = {
  DescriptionField: FormattedDescriptionField,
  rawDescription: (e) => {console.log("A" + e)},
  TitleField: CustomTitleField
};

const schema = {};


const uiSchema = {};

var This;
//const log = (type: {}) => console.log.bind(console, type);
const log = console.log;

class FormPage extends React.Component<IFormPageProps, IFormPageState> {

  constructor(props:any) {
    super(props);
    This = this;
    this.state ={
      status: STATUS_FORM_LOADING,
      schema: {"title": "Loading...", "type": "object"},
      uiSchema: {"title": "status"},
      step: 0,
      data: {
        "email": "aramaswamis@gmail.com",
        "acceptTerms": true,
        "address": {"zipcode": "30022"},
        "race": "10K"
      },
      responseId: null
    };
  }
  unescapeJSON(json:{}) {
    /* Un-escapes dollar signs in the json.
     */
    let str = JSON.stringify(json);
    return JSON.parse(JSON.stringify(json).replace(/\\\\u0024/g,"$"));
  }
  /* Modifies the master schema based on the options specific to this form.
   */
  populateSchemaWithOptions(schema, options) {
    for (let key in schema) {
      let schemaItem = schema[key];
      // Delete fields & sub-fields of the schema that aren't included in schemaModifiers.
      if (!options.hasOwnProperty(key)) {
        if (!~["type", "properties"].indexOf(key)) {
          //console.log("Deleting key " + key);
          delete schema[key];
        }
        continue;
      }
      // Recursively call this function on objects (with properties).
      if (this.isObject(schemaItem)) {
        if (options[key] === Object(options[key])) {
          if (schemaItem["properties"])
            this.populateSchemaWithOptions(schemaItem["properties"], options[key]);
          else // for an object without properties, such as {type: "string", title: "Last Name"}, or {enum: [1,2,3]}
            this.overwriteFlatJSON(schemaItem, options[key])
        }
      }
      // For everything else (strings, something with an "enum" property)
      else {
        schema[key] = options[key];
        //console.log("Replacing for key " + key + ", value " + schemaItem + " => " + options[key]);
      }
    }
    
  }

  /* Takes old json and replaces its properties with new's properties whenever possible.
   */
  overwriteFlatJSON(oldObj, newObj) {
    for (let i in newObj) {
      oldObj[i] = newObj[i];
    }
  }
  
  isObject(obj) {
    return Object(obj) === obj && !Array.isArray(obj)
  }

  /* Removes keys based on a test function.
   */
  removeKeysBasedOnTest(obj, testFn) {
    for (let i in obj) {
      if (!obj.hasOwnProperty(i)) continue;
      if (testFn(i)) {
        //console.log("Not deleting " + i);
        continue;
      }
      else if (this.isObject(obj[i])) {
        //console.log("checking to filter for object: ", obj, i, obj[i]);
          this.removeKeysBasedOnTest(obj[i], testFn);
      }
      else {
        delete obj[i];
        //console.log("Deleting " + i);
      }
    }
    return obj;
  }

  /* Starting with a schemaModifier,
   * removes all non-"ui:..." keys (and className) from a given uiSchema.
   */
  filterUiSchema(obj) {
    return this.removeKeysBasedOnTest(obj, (attr) => {
      let searchString = "ui:";
      return attr && (attr.substr(0, searchString.length) === searchString || attr == "classNames");
    });
  }

  getFormUrl(action) {
    let formId = this.props.formId['$oid'];
    return this.props.apiEndpoint + "?action=" + action + "&id=" + formId;
  }

  componentDidMount() {    
    
    axios.get(this.getFormUrl("formRender"), {"responseType": "json"})
        .then(response => response.data.res[0])
        .then(this.unescapeJSON)
        .then((data) => {
          console.log("DATA:\n", data);
          var options = data["schemaModifier"].value;
          var uiSchema = options;
          var schema = data["schema"].value;
          console.log(schema);
          schema = deref(schema);
          console.log(schema);

          // Allow for top level config (title, description, payment options, etc.)
          for (let key in options) {
            if (key != "properties" && typeof options[key] != "boolean") {
              schema[key] = options[key];
            }
          }

          this.populateSchemaWithOptions(schema.properties, options);
          this.filterUiSchema(uiSchema);
          console.log(options, uiSchema, schema);
            
          This.setState({ uiSchema: uiSchema, schema: schema, status: STATUS_FORM_RENDERED });
          
        });

    
  }
  goBackToFormPage() {
    This.setState({status: STATUS_FORM_RENDERED});
  }
  onSubmit(data: {formData: {}}) {
    var formData = data.formData;
    var instance = axios.create({
      headers: {
        "Content-Type": "application/json"
      }
    });
    instance.post(this.getFormUrl("formSubmit"), formData).then((response) => {
      let res = response.data.res;
      if (!(res.success == true && res.inserted_id["$oid"])) {
        throw "Response not formatted correctly: " + JSON.stringify(res);
      }
      this.setState({status: STATUS_FORM_SUBMITTED, data: formData, responseId: res.inserted_id["$oid"]});
    }).catch((err) => {
      alert("Error. " + err);
    });
  }
  render() {
    if (this.state.status == STATUS_FORM_LOADING) {
      return ( 
        <div className='my-nice-tab-container'>
          <div className='loading-state'>Loading...</div>
        </div>)
    } else if (this.state.status == STATUS_FORM_RENDERED) {
    return (  
        <div className="App">
            <Form
            schema={this.state.schema}
            uiSchema={this.state.uiSchema}
            formData={this.state.data}
            widgets={widgets}
            fields={fields}
            ObjectFieldTemplate={ObjectFieldTemplate}
            transformErrors={transformErrors}
            onChange={() => log('changed')}
            onSubmit={(e) => this.onSubmit(e)}
            onError={() => log('errors')}
            />
        </div>
      );
    }
    else if (this.state.status == STATUS_FORM_SUBMITTED) {
      return (<FormConfirmationPage
              schema={this.state.schema}
              uiSchema={this.state.uiSchema}
              data={this.state.data}
              goBack={this.goBackToFormPage}
              responseId={this.state.responseId}
              />);
    }
  }
}

export default FormPage;