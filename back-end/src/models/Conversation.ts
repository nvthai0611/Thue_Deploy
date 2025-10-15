/******************************************************************************
                                 Constants
******************************************************************************/

// const DEFAULT_USER_VALS = (): IMembership => ({
//   name: '',
//     duration_months: 0,
//     total_price: 0,
// });

/******************************************************************************
                                  Types
******************************************************************************/

export interface IConversation {
  tenant_id: string;
  owner_id: string;
  status: string;
}
/******************************************************************************
                                  Setup
******************************************************************************/

// Initialize the "parseUser" function
// const parseUser = parseObject<IUser>({
//   name: isString,
//   email: isString,
//   role: isEnumVal(RoleEnum),
//   phone: isString,
//   });

//   const parseUserCreate = parseObject<IAddUserReq>({
//   name: isString,
//   email: isEmail,
//   phone: isString,
//   })

/******************************************************************************
                                 Functions
******************************************************************************/

/**
 * New user object.
 */
// function newUser(user?: Partial<IUser>): IUser {
//   const retVal = { ...DEFAULT_USER_VALS(), ...user };
//   return parseUser(retVal, errors => {
//     throw new Error('Setup new user failed ' + JSON.stringify(errors, null, 2));
//   });
// }

// /**
//  * Check is a user object. For the route validation.
//  */
// function testUser(arg: unknown, errCb?: TParseOnError): arg is IUser {
//   return !!parseUser(arg, errCb);
// }

// /**
//  * Check is a user add request object. For the route validation.
//  */
// function testAddUser(arg: unknown, errCb?: TParseOnError): arg is IAddUserReq {
//   return !!parseUserCreate(arg, errCb);
// }
/******************************************************************************
                                Export default
******************************************************************************/

export default {
  //   new: newUser,
  //   test: testUser,
  //   testAddUser:testAddUser,
} as const;
