package com.meadowhawk.cah.util.dao;

import org.springframework.stereotype.Component;

import com.meadowhawk.cah.dao.AbstractJpaDAO;
import com.meadowhawk.cah.util.service.model.AppConfig;
import com.meadowhawk.cah.util.service.model.AppConfigEntry;

@Component
public class AppConfigEntryDao extends AbstractJpaDAO< AppConfigEntry > {

	public AppConfigEntryDao() {
		setClazz(AppConfigEntry.class );
	}
	
	/**
	 * 
	 * @return
	 */
	public AppConfig loadAppConfig(){
		return new AppConfig(this.findAll());
	}
}
