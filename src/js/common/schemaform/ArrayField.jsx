import React from 'react';
import _ from 'lodash/fp';
import Scroll from 'react-scroll';
import { focusElement } from '../utils/helpers';

import {
  retrieveSchema,
  toIdSchema,
  getDefaultFormState,
  deepEquals
} from 'react-jsonschema-form/lib/utils';

import { errorSchemaIsValid } from './helpers';

const Element = Scroll.Element;
const scroller = Scroll.scroller;

const scrollToFirstError = () => {
  setTimeout(() => {
    const errorEl = document.querySelector('.usa-input-error, .input-error-date');
    if (errorEl) {
      const position = errorEl.getBoundingClientRect().top + document.body.scrollTop;
      Scroll.animateScroll.scrollTo(position - 10, {
        duration: 500,
        delay: 0,
        smooth: true
      });
      focusElement(errorEl);
    }
  }, 100);
};

export default class ArrayField extends React.Component {
  constructor(props) {
    super(props);
    const formData = Array.isArray(props.formData) ? props.formData : null;
    let items;
    if (!formData || formData.length === 0) {
      items = [getDefaultFormState(props.schema.items, null, props.registry.definitions) || {}];
    } else {
      items = getDefaultFormState(props.schema, formData, props.registry.definitions) || [];
    }
    this.state = {
      items,
      editing: items.map(() => false)
    };
    this.onItemChange = this.onItemChange.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
    this.onItemBlur = this.onItemBlur.bind(this);
    this.scrollToTop = this.scrollToTop.bind(this);
    this.scrollToRow = this.scrollToRow.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const propsWithoutDataUnchanged = deepEquals(_.omit('formData', this.props), _.omit('formData', nextProps));
    const stateUnchanged = deepEquals(this.state, nextState);

    if (propsWithoutDataUnchanged && stateUnchanged && deepEquals(nextProps.formData, nextState.items)) {
      return false;
    }

    return true;
  }

  onItemChange(indexToChange, value) {
    const newState = _.set('items', this.state.items.map(
      (current, index) => {
        return index === indexToChange
          ? value
          : current;
      }
    ), this.state);
    this.setState(newState, () => {
      this.props.onChange(newState.items);
    });
  }

  onItemBlur(index, path = []) {
    this.props.onBlur([index].concat(path));
  }

  scrollToTop() {
    setTimeout(() => {
      scroller.scrollTo(`topOfTable_${this.props.idSchema.$id}`, {
        duration: 500,
        delay: 0,
        smooth: true,
        offset: -60
      });
    }, 100);
  }

  scrollToRow(id) {
    setTimeout(() => {
      scroller.scrollTo(`table_${id}`, {
        duration: 500,
        delay: 0,
        smooth: true,
        offset: 0
      });
    }, 100);
  }

  handleEdit(index, status = true) {
    this.setState(_.set(['editing', index], status, this.state), () => {
      this.scrollToRow(`${this.props.idSchema.$id}_${index}`);
    });
  }

  handleUpdate(index) {
    if (errorSchemaIsValid(this.props.errorSchema[index])) {
      this.setState(_.set(['editing', index], false, this.state), () => {
        this.scrollToTop();
      });
    } else {
      const touchedSchema = _.set(index, true, this.state.touchedSchema);
      this.setState({ touchedSchema }, () => {
        scrollToFirstError();
      });
    }
  }

  handleAdd() {
    const lastIndex = this.state.items.length - 1;
    if (errorSchemaIsValid(this.props.errorSchema[lastIndex])) {
      const newEditing = this.state.editing.map((val, index) => {
        return (index + 1) === this.state.editing.length
          ? false
          : val;
      });
      const newState = _.assign(this.state, {
        items: this.state.items.concat(getDefaultFormState(this.props.schema.items, undefined, this.props.registry.definitions) || {}),
        editing: newEditing.concat(false)
      });
      this.setState(newState, () => {
        this.scrollToRow(`${this.props.idSchema.$id}_${lastIndex + 1}`);
        this.props.onChange(newState.items);
      });
    } else {
      const touchedSchema = _.set(lastIndex, true, this.state.touchedSchema);
      this.setState({ touchedSchema }, () => {
        scrollToFirstError();
      });
    }
  }

  handleRemove(indexToRemove) {
    const newState = _.assign(this.state, {
      items: this.state.items.filter((val, index) => index !== indexToRemove),
      editing: this.state.editing.filter((val, index) => index !== indexToRemove),
    });
    this.setState(newState, () => {
      this.props.onChange(newState.items);
      this.scrollToTop();
    });
  }

  render() {
    const {
      uiSchema,
      errorSchema,
      idSchema,
      disabled,
      readonly,
      registry,
      formContext,
      touchedSchema,
      requiredSchema,
      schema
    } = this.props;
    const definitions = registry.definitions;
    const itemsSchema = retrieveSchema(schema.items, definitions);
    const { TitleField, SchemaField } = registry.fields;
    const ViewField = uiSchema['ui:options'].viewField;

    const title = uiSchema['ui:title'] || schema.title;
    const hasTextDescription = typeof uiSchema['ui:description'] === 'string';
    const DescriptionField = !hasTextDescription && typeof uiSchema['ui:description'] === 'function'
      ? uiSchema['ui:description']
      : null;

    return (
      <div>
        {title
            ? <TitleField
                id={`${idSchema.$id}__title`}
                title={title}
                formContext={formContext}/> : null}
        {hasTextDescription && <p>{uiSchema['ui:description']}</p>}
        {DescriptionField && <DescriptionField options={uiSchema['ui:options']}/>}
        <div className="va-growable">
          <Element name={`topOfTable_${idSchema.$id}`}/>
          {this.state.items.map((item, index) => {
            const itemIdPrefix = `${idSchema.$id}_${index}`;
            const itemIdSchema = toIdSchema(itemsSchema, itemIdPrefix, definitions);
            const isLast = this.state.items.length === (index + 1);
            const isEditing = this.state.editing[index];
            const notLastOrMultipleRows = !isLast || this.state.items.length > 1;
            let itemTouched = (touchedSchema ? touchedSchema[index] : false);
            if (this.state.touchedSchema && typeof this.state.touchedSchema[index] !== 'undefined') {
              itemTouched = this.state.touchedSchema[index];
            }
            if (isLast || isEditing) {
              return (
                <div key={index} className={notLastOrMultipleRows ? 'va-growable-background' : null}>
                  <Element name={`table_${itemIdPrefix}`}/>
                  <div className="row small-collapse">
                    <div className="small-12 columns va-growable-expanded">
                      {isLast && this.state.items.length > 1 && uiSchema['ui:options'].itemName
                          ? <h5>New {uiSchema['ui:options'].itemName}</h5>
                          : null}
                      <div className="input-section">
                        <SchemaField key={index}
                            schema={itemsSchema}
                            uiSchema={uiSchema.items}
                            errorSchema={errorSchema ? errorSchema[index] : undefined}
                            idSchema={itemIdSchema}
                            formData={item}
                            onChange={(value) => this.onItemChange(index, value)}
                            onBlur={(path) => this.onItemBlur(index, path)}
                            touchedSchema={itemTouched}
                            registry={this.props.registry}
                            requiredSchema={requiredSchema}
                            disabled={disabled}
                            readonly={readonly}/>
                      </div>
                      {notLastOrMultipleRows &&
                        <div className="row small-collapse">
                          <div className="small-6 left columns">
                            {!isLast && <button className="float-left" onClick={() => this.handleUpdate(index)}>Update</button>}
                          </div>
                          <div className="small-6 right columns">
                            <button className="usa-button-outline float-right" onClick={() => this.handleRemove(index)}>Remove</button>
                          </div>
                        </div>}
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <div key={index} className="va-growable-background">
                <div className="row small-collapse">
                  <div className="small-9 columns">
                    <ViewField
                        formData={item}
                        onEdit={() => this.handleEdit(index)}/>
                  </div>
                  <div className="small-3 columns">
                    <button className="usa-button-outline float-right" onClick={() => this.handleEdit(index)}>Edit</button>
                  </div>
                </div>
              </div>
            );
          })}
          <button type="button" className="usa-button-outline va-growable-add-btn" onClick={this.handleAdd}>Add Another</button>
        </div>
      </div>
    );
  }
}

ArrayField.propTypes = {
  schema: React.PropTypes.object.isRequired,
  uiSchema: React.PropTypes.object,
  errorSchema: React.PropTypes.object,
  touchedSchema: React.PropTypes.object,
  requiredSchema: React.PropTypes.object,
  idSchema: React.PropTypes.object,
  onChange: React.PropTypes.func.isRequired,
  formData: React.PropTypes.array,
  required: React.PropTypes.bool,
  disabled: React.PropTypes.bool,
  readonly: React.PropTypes.bool,
  registry: React.PropTypes.shape({
    widgets: React.PropTypes.objectOf(React.PropTypes.oneOfType([
      React.PropTypes.func,
      React.PropTypes.object,
    ])).isRequired,
    fields: React.PropTypes.objectOf(React.PropTypes.func).isRequired,
    definitions: React.PropTypes.object.isRequired,
    formContext: React.PropTypes.object.isRequired,
  })
};

