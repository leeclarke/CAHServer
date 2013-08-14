package com.meadowhawk.cah.service.business;

import javax.persistence.NoResultException;
import javax.ws.rs.core.Response.Status;

import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.meadowhawk.cah.dao.CAHUserDAO;
import com.meadowhawk.cah.exception.CAHAppException;
import com.meadowhawk.cah.model.CAHUser;
import com.meadowhawk.cah.util.StringUtil;
import com.meadowhawk.cah.util.model.GoogleInfo;
import com.meadowhawk.cah.util.service.AuthRequiredBeforeException;

/**
 * @author lee
 */
@Component
public class HomePiUserService {

	@Autowired
	CAHUserDAO homePiUserDao;

	
	/**
	 * Retrieve user by email address.
	 * @param email
	 * @return
	 */
	public CAHUser getUser(String email){
		return homePiUserDao.findByUserName(email);
	}


	/**
	 * Updates user data.
	 * @param hpUser
	 * @return
	 */
	public CAHUser updateUserData(CAHUser hpUser){
		hpUser.setUpdateTime(new DateTime());
		homePiUserDao.update(hpUser);
		
		return hpUser;
	}
	
	/**
	 * Retrieve existing user from Google Auth, if not found create new user.
	 * @param user - google auth user info
	 * @return homePi user
	 */
	public CAHUser getUserFromGoogleAuth(GoogleInfo user) throws CAHAppException {
		CAHUser hUser =  null;
		try{
			hUser = homePiUserDao.findByEmail(user.getEmail());
			hUser.setGoogleAuthToken(user.getAuth_token());  //save new auth code.
			updateUserData(hUser);
			//TODO: Consider calling adaptor to update fields if diff from stored?
		} catch(NoResultException nre){
		//	hUser = UserAuthAdaptor.adaptGoogleInfo(user);
			homePiUserDao.save(hUser);
		}
		
		return hUser;
	}


	/**
	 * Retrieves User profile, only public data is displayed unless auth tokens match.
	 * @param userName
	 * @param authToken
	 * @return
	 */
	public CAHUser getUserData(String userName, String authToken) {
		CAHUser hUser =  null;
		try{
			hUser = homePiUserDao.findByUserName(userName);

		} catch(NoResultException nre){
			throw new CAHAppException(Status.NOT_FOUND,"Invalid user");
		}
		
		return hUser;
	}
	
	/**
	 * Retrieves User profile, only public data is displayed unless auth tokens match.
	 * @param userId
	 * @param authToken
	 * @return
	 */
	public CAHUser getUserData(Long userId, String authToken) {
		if(userId == null){
			throw new CAHAppException(Status.BAD_REQUEST,"Invalid key value for request.");
		}
		CAHUser hUser;
		try{
			hUser = homePiUserDao.findByUserId(userId);

		} catch(NoResultException nre){
			throw new CAHAppException(Status.NOT_FOUND,"Invalid user");
		}
		
		return hUser;
	}


	/**
	 * Update user data.  Not all values are editable!
	 * @param userName 
	 * @param authToken - auth token
	 * @param updateUser - user
	 * @return updated user if successful
	 * @deprecated
	 */
	@AuthRequiredBeforeException
	public CAHUser updateUserData(String userName, String authToken, CAHUser updateUser) {
		CAHUser hUser = null;
			try {
				hUser = homePiUserDao.findByUserName(userName);
				hUser.setFamilyName(updateUser.getFamilyName());
				hUser.setGivenName(updateUser.getGivenName());
				hUser.setFullName(updateUser.getFullName());
				hUser.setPicLink(updateUser.getPicLink());
				hUser.setUserName(updateUser.getUserName());
				hUser.setUpdateTime(new DateTime());
				homePiUserDao.update(hUser);
				hUser = homePiUserDao.findByUserName(hUser.getUserName());
			} catch (NoResultException nre) {
				throw new CAHAppException(Status.NOT_FOUND, "Invalid user");
			}

		return hUser;
	}
	
	/**
	 * Updates are done based on uid because the user can change their userName.
	 * @param userId
	 * @param authToken
	 * @param updateUser
	 * @return
	 */
	@AuthRequiredBeforeException
	public CAHUser updateUserData(Long userId, String authToken, CAHUser updateUser) {
		CAHUser hUser = null;
		try {
			hUser = homePiUserDao.findByUserId(userId);
			hUser.setFamilyName(updateUser.getFamilyName());
			hUser.setGivenName(updateUser.getGivenName());
			hUser.setFullName(updateUser.getFullName());
			hUser.setPicLink(updateUser.getPicLink());
			hUser.setUserName(updateUser.getUserName());
			hUser.setUpdateTime(new DateTime());
			homePiUserDao.update(hUser);
			hUser = homePiUserDao.findByUserId(userId);
		} catch (NoResultException nre) {
			throw new CAHAppException(Status.NOT_FOUND, "Invalid user");
		}

	return hUser;
	}
	
	/**
	 * Validates user token and user key (userId|userName).
	 * @param userKey
	 * @param authToken
	 * @return - true if authorized.
	 */
	public boolean verifyUserToken(Object userKey, String authToken){
		if(userKey == null || StringUtil.isNullOrEmpty(authToken) ){
			return false;
		}
		if(userKey instanceof Long){
			return homePiUserDao.authorizeToken((Long)userKey, authToken);			
		}else if(userKey instanceof String){
			return homePiUserDao.authorizeToken((String)userKey, authToken);
		}
		
		return false;
	}


}
