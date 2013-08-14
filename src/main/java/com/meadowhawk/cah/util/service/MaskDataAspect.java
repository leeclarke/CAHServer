package com.meadowhawk.cah.util.service;

import java.util.Arrays;

import javax.ws.rs.core.Response.Status;

import org.apache.log4j.Logger;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.After;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.meadowhawk.cah.exception.CAHAppException;
import com.meadowhawk.cah.service.business.HomePiUserService;
import com.meadowhawk.homepi.model.MaskableDataObject;


/**
 * Works along with the @MaskData annotation to filter returned data based on user ownership. Note that field objects are not enforced, it 
 * is up to the Parent object to override the setMaskedView() method and enforce.
 * @author lee
 */
@Aspect
@Component
public class MaskDataAspect{
	private static Logger log = Logger.getLogger( MaskDataAspect.class );
	
	@Autowired
	HomePiUserService userService;

	@Pointcut("execution(* com.meadowhawk.cah.service.business.*.*(..))")
  public void getAuthToken() { }

	@Around("@annotation(MaskData)")
	public Object checkForPrivateData(ProceedingJoinPoint pjp) throws Throwable{
    Object[] args = pjp.getArgs();  
    Object obj = pjp.proceed();  
    
    if (args != null && log.isDebugEnabled()) {  
    	log.debug(">>>>>   AFTER Arguments : " + Arrays.toString(pjp.getArgs()));
    }  
    
    if (args != null && args.length >= 2)  
    {  
    	if(obj instanceof MaskableDataObject){
				String authToken = (String) args[1];
				if(userService.verifyUserToken(args[0], authToken)){
	  			((MaskableDataObject)obj).setMaskedView(false);
	  		}
    	}
          
    }  else{
    	log.error("MaskData annotation used with too few params. see Docs.");
    }
    
    return obj;
	}

	@Before("@annotation(AuthRequiredBeforeException)")
	public void verifyAuthFirstReportException(JoinPoint pjp)	throws Throwable {
		Object[] args = pjp.getArgs();

		if (args != null && log.isDebugEnabled()) {
			log.debug(">>>>>   BEFORE Arguments : " + Arrays.toString(pjp.getArgs()));
		}
		String authToken = (String) args[1];
		if(!userService.verifyUserToken(args[0], authToken)){
			throw new CAHAppException(Status.FORBIDDEN);			
		}
	}
}
