import type {BasicInput} from './basic-input.model';
import type {InputDataType} from './input-data-type.model';
import type {InputUiType} from './input-ui-type.model';

export type CheckboxInput = BasicInput<InputUiType.CHECKBOX, InputDataType.BOOLEAN>;