package com.meadowhawk.cah.exception.mapper;

import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

import org.springframework.stereotype.Component;

import com.meadowhawk.cah.exception.CAHAppException;

@Provider
@Component
public class CAHAppExceptionMapper implements ExceptionMapper<CAHAppException> {

	public Response toResponse(CAHAppException e) {
		return Response
                .status((e.getStatus() != null)? e.getStatus():Response.Status.BAD_REQUEST)
                .entity(e.toResponse())
                .type(MediaType.APPLICATION_JSON)
                .build();
	}

}
