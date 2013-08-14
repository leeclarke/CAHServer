package com.meadowhawk.cah.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import org.codehaus.jackson.map.annotate.JsonFilter;
import org.codehaus.jackson.map.annotate.JsonSerialize;
import org.hibernate.annotations.Type;
import org.joda.time.DateTime;

import com.meadowhawk.cah.rs.JodaDateTimeSerializer;

/**
 * HomePi user.
 * @author lee
 */
@Entity
@Table(name = "users")

@NamedQueries(value={@NamedQuery(name="CAHUser.findByEmail", query = "select u from CAHUser u where u.email = :email"),
		@NamedQuery(name="CAHUser.findByUserName", query = "select u from CAHUser u where u.userName = :name"),
		@NamedQuery(name="CAHUser.findByUserId", query = "select u from CAHUser u where u.userId = :uid"),
		@NamedQuery(name="CAHUser.authToken", query="select count(*) from CAHUser u where u.userName = :userName and u.googleAuthToken = :authToken")})
@JsonFilter("privateView")
public class CAHUser {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "user_id")
	private Long userId;
	
	@Column(name = "create_time")
	@Type(type="org.jadira.usertype.dateandtime.joda.PersistentDateTime")
	private DateTime createTime = new DateTime();
	
	@Column(name = "update_time")
	@Type(type="org.jadira.usertype.dateandtime.joda.PersistentDateTime")
	private DateTime updateTime;
	
	@Column(name = "user_name", unique=true)
	private String userName;
	
	@Column(name = "email", length=255, unique=true	)
	private String email;

	@Column(name = "gauth_token")
	private String googleAuthToken;
	
	@Column(name = "locale")
	private String locale;
	
	@Column(name = "pic_link")
	private String picLink;
	
	@Column(name = "given_name")
	private String givenName;
	
	@Column(name = "family_name")
	private String familyName;
	
	@Column(name = "full_name")
	private String fullName;
	

	public Long getUserId() {
		return userId;
	}
	public void setUserId(Long userId) {
		this.userId = userId;
	}
	@JsonSerialize(using=JodaDateTimeSerializer.class)
	public DateTime getCreateTime() {
		return createTime;
	}
	public void setCreateTime(DateTime createTime) {
		this.createTime = createTime;
	}
	@JsonSerialize(using=JodaDateTimeSerializer.class)
	public DateTime getUpdateTime() {
		return updateTime;
	}
	public void setUpdateTime(DateTime updateTime) {
		this.updateTime = updateTime;
	}
	public String getUserName() {
		return userName;
	}
	public void setUserName(String userName) {
		this.userName = userName;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	
	public String getLocale() {
		return locale;
	}
	public void setLocale(String locale) {
		this.locale = locale;
	}
	public String getPicLink() {
		return picLink;
	}
	public void setPicLink(String picLink) {
		this.picLink = picLink;
	}
	public String getGivenName() {
		return givenName;
	}
	public void setGivenName(String givenName) {
		this.givenName = givenName;
	}
	public String getFamilyName() {
		return familyName;
	}
	public void setFamilyName(String familyName) {
		this.familyName = familyName;
	}
	public String getFullName() {
		return fullName;
	}
	public void setFullName(String fullName) {
		this.fullName = fullName;
	}
	public String getGoogleAuthToken() {
		return googleAuthToken;
	}
	public void setGoogleAuthToken(String googleAuthToken) {
		this.googleAuthToken = googleAuthToken;
	}
	
}
