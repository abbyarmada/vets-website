import { combineReducers } from 'redux';

import login from '../../login/reducers/login';
import profile from '../../user-profile/reducers/profile';

import rx from '../../rx/reducers';
import msg from '../../messaging/reducers';

export default combineReducers({
  user: combineReducers({
    login,
    profile
  }),
  health: combineReducers({
    rx,
    msg,
  }),
});
