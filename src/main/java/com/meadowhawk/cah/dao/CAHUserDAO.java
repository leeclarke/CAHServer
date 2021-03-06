package com.meadowhawk.cah.dao;

import javax.persistence.NoResultException;

import org.springframework.stereotype.Component;

import com.meadowhawk.cah.model.CAHUser;

@Component
public class CAHUserDAO  extends AbstractJpaDAO< CAHUser >{
	
	public CAHUserDAO() {
		setClazz(CAHUser.class );
	}


	/**
	 * @param userName
	 * @return
	 */
	public CAHUser findByUserName(String userName) throws NoResultException{
		return entityManager.createNamedQuery("CAHUser.findByUserName",this.clazz).setParameter("name", userName).getSingleResult();
	}
	
	/**
	 * @param email
	 * @return
	 * @throws NoResultException
	 */
	public CAHUser findByEmail(String email) throws NoResultException{
		return entityManager.createNamedQuery("CAHUser.findByEmail",this.clazz).setParameter("email", email).getSingleResult();
	}

	/**
	 * @param userId
	 * @return
	 * @throws NoResultException
	 */
	public CAHUser findByUserId(Long userId) {
		return entityManager.createNamedQuery("CAHUser.findByUserId",this.clazz).setParameter("uid", userId).getSingleResult();
	}

	/**
	 * Verifies user by checking user name and auth token.
	 * @param userName
	 * @param authToken
	 * @return true if valid
	 */
	public boolean authorizeToken(String userName, String authToken) {
		Long ct = entityManager.createNamedQuery("CAHUser.authToken",Long.class).setParameter("userName", userName).setParameter("authToken", authToken).getSingleResult();
		return (ct==1)?true:false;
	}


	/**
	 * Verifies user by checking userId and auth token.
	 * @param userId
	 * @param authToken
	 * @return
	 */
	public boolean authorizeToken(Long userId, String authToken) {
		try{
			CAHUser user = this.findByUserId(userId);
			return this.authorizeToken(user.getUserName(), authToken);
		}
		catch(Exception e ){
			return false;
		}
	}

}

	