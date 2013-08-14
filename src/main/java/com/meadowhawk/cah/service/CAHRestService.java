package com.meadowhawk.cah.service;

import java.net.URI;

import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;
import javax.ws.rs.core.UriBuilder;
import javax.ws.rs.core.UriInfo;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import com.meadowhawk.cah.exception.CAHAppException;
import com.meadowhawk.cah.model.CAHUser;
import com.meadowhawk.cah.service.business.HomePiUserService;
import com.meadowhawk.cah.util.StringUtil;
import com.meadowhawk.cah.util.model.PublicRESTDoc;
import com.meadowhawk.cah.util.model.PublicRESTDocMethod;

@Path("/homepi")
@Component
@PublicRESTDoc(serviceName = "HomePiService", description = "Pi focused management services specifically for Pis.")
public class CAHRestService {
	private static final String APP_ID = "app_id";
	private static Logger log = Logger.getLogger( CAHRestService.class );
	private static final String ACCESS_TOKEN = "access_token";
	
	@Context UriInfo uriInfo;
	
	@Autowired
	HomePiUserService userService;
		

//	
//	@POST
//	@Path("/user/{user_id}/pi/{piSerialId}/api")
//	@Produces(MediaType.APPLICATION_JSON)
//	@PublicRESTDocMethod(endPointName="Update Pi API Key", description="Updated the API key for the Pi. This can only be called by an auth user. Sadly for security reasons the user has to change the API stored on the PI manually. Returns 204 if sucessful.", sampleLinks={"/homepi/pi/01r735ds720/reg/api/de4d9e75-d6b3-43d7-9fef-3fb958356ded"})
//	public Response updatePiApiKey(@PathParam("user_id") String userId, @PathParam("piSerialId") String piSerialId, @HeaderParam(ACCESS_TOKEN) String authToken) {
//		deviceManagementService.updateApiKey(userId, authToken, piSerialId);
//		return Response.noContent().build();
//	}

	@GET
	@Path("/user/{user_id}")
	@Produces(MediaType.APPLICATION_JSON)
	@PublicRESTDocMethod(endPointName = "User Profile", description = "Retrieve user profile. Include access_token in head to gain owner view.", sampleLinks = { "/user/profile/test_user" })
	public Response getUser(@PathParam("user_id") String userId, @HeaderParam(ACCESS_TOKEN) String authToken){
		if(!StringUtil.isNullOrEmpty(userId)){
			//get authfrom request or set to null
			CAHUser hUser = userService.getUserData(userId, authToken);
			return Response.ok(hUser).build(); 
		} else {
			throw new CAHAppException(Status.NOT_FOUND,"Invalid user ID");
		}
	}
//	
//	@GET
//	@Path("/user/{user_id}/pi/{pi_serial_id}/log/{app_name}")
//	@Produces(MediaType.APPLICATION_JSON)
//	@PublicRESTDocMethod(endPointName="Log Pi Message", group="Logs", description="Retrieves logs entries for given Pi. Pi API key or user auth may be required.", sampleLinks={"/homepi/pi/8lhdfenm1x/log"})
//	public List<LogData> getLogsForApp(@PathParam("user_id") String userId, @HeaderParam(ACCESS_TOKEN) String authToken, @PathParam("pi_serial_id") String piSerialId, @PathParam("app_name") String appName, @QueryParam("log_type") String logType, @QueryParam("log_key") String logkey){
//		
//		Map<WEB_PARAMS_LOG_DATA, Object> params = new HashMap<WEB_PARAMS_LOG_DATA, Object>();
//		params.put(WEB_PARAMS_LOG_DATA.APP_NAME, appName);
//		params.put(WEB_PARAMS_LOG_DATA.LOG_TYPE, logType);
//		params.put(WEB_PARAMS_LOG_DATA.LOG_KEY, logkey);
//		
//		
//		return logDataService.getLogDataBySearchType(userId, authToken,piSerialId, LogDataService.SEARCH_TYPE.DYNAMIC, params );
//
//	}
	

	
	
//	//ProfileManagement
//	@GET
//	@Path("/user/{user_id}/pi/{piSerialId}")
//	@Produces(MediaType.APPLICATION_JSON)
//	@PublicRESTDocMethod(endPointName = "Get PiProfile", description = "Retrieve pi profile by pi serial id. Include access_token for owner view.", sampleLinks = { "/homepi/user/test_user/pi/8lhdfenm1x" })
//	public Response getUserPiProfile(@PathParam("user_id") String userName,@PathParam("piSerialId") String piSerialId, @HeaderParam(ACCESS_TOKEN) String authToken){
//		PiProfile profile = userService.getPiProfile(userName, authToken,piSerialId);
//		return Response.ok(profile).build();
//	}
	
	
//	@POST
//	@Path("/user/{user_name}/pi/{pi_serial_id}/app")
//	@PublicRESTDocMethod(endPointName = "Assign App to PiProfile", description = "Assignes the specified Managed App to the Pi Profile by passing the app_id header param. 'access_token' is also required.", sampleLinks = { "/homepi/user/test_user/pi/8lhdfenm1x" })
//	public Response assignAppToPiProfile(@PathParam("user_name") String userName,@PathParam("pi_serial_id") String piSerialId, @HeaderParam(ACCESS_TOKEN) String authToken, @HeaderParam(APP_ID) Long appId){
//		userService.addAppToProfile(userName, authToken,piSerialId, appId);
//		return Response.noContent().build();
//	}
//	
//	@DELETE
//	@Path("/user/{user_name}/pi/{pi_serial_id}/app")
//	@PublicRESTDocMethod(endPointName = "Remove Assignment App to PiProfile", description = "Assignes the specified Managed App to the Pi Profile by passing the app_id header param. 'access_token' is also required.", sampleLinks = { "/homepi/user/test_user/pi/8lhdfenm1x" })
//	public Response deleteAppToPiProfile(@PathParam("user_name") String userName,@PathParam("pi_serial_id") String piSerialId, @HeaderParam(ACCESS_TOKEN) String authToken, @HeaderParam(APP_ID) Long appId){
//		userService.deleteAppToProfile(userName, authToken,piSerialId, appId);
//		return Response.noContent().build();
//	}
	
	
	/**
	 * Generates a URI for redirect to one of the other endpoints in the current Service.
	 * @param methodName - one of the public methods in this service.
	 * @return - URI for redirect.
	 */
	protected URI getUriRedirect(String methodName){
		UriBuilder ub = uriInfo.getBaseUriBuilder().path(CAHRestService.class);
		URI redirectURI = ub.path(CAHRestService.class, methodName).build();
		
		return redirectURI;
	}
}