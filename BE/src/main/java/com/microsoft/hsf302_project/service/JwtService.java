package com.microsoft.hsf302_project.service;


import com.microsoft.hsf302_project.entity.User;
import com.microsoft.hsf302_project.exception.AppException;
import com.microsoft.hsf302_project.exception.ErrorCode;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Set;
import java.util.StringJoiner;
import java.util.UUID;

@Service
@Slf4j
public class JwtService {
    @Value("${jwt.secret}")
    private  String jwtSecret;

    @Value("${jwt.expiration}")
    private  long jwtexpiration;

    @Value("${refreshjwt.expriation}")
    private  long refreshjwtexpiration;
    public String generateToken(User user){

        JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.HS512);


        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .issuer("swp391.com")
                .subject(user.getUsername())
                .issueTime(new Date())
                .expirationTime(Date.from(Instant.now().plus(jwtexpiration, ChronoUnit.MINUTES)))
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", buidScope(user.getRole()))
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());


        JWSObject jwsObject = new JWSObject(jwsHeader,payload);

        try {
            jwsObject.sign(new MACSigner(jwtSecret.getBytes()));
        } catch (JOSEException e) {
            log.info("can not generate token");
        }
        return  jwsObject.serialize();

    }

    public String buidScope(String roles){
        StringJoiner stringJoiner = new StringJoiner(" ");

            stringJoiner.add("ROLE_"+roles);

        return stringJoiner.toString();
    }


    public String generateRefreshToken(User user){

        JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.HS512);


        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .issuer("swp391.com")
                .subject(user.getUsername())
                .issueTime(new Date())
                .expirationTime(Date.from(Instant.now().plus(refreshjwtexpiration, ChronoUnit.DAYS)))
                .jwtID(UUID.randomUUID().toString())
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());


        JWSObject jwsObject = new JWSObject(jwsHeader,payload);

        try {
            jwsObject.sign(new MACSigner(jwtSecret.getBytes()));
        } catch (JOSEException e) {
            log.info("can not generate refresh token");
        }
        return  jwsObject.serialize();
    }


    public SignedJWT verifyJwt(String token) throws JOSEException, ParseException {
        JWSVerifier jwsVerifier = new MACVerifier(jwtSecret.getBytes());
        SignedJWT signedJWT = SignedJWT.parse(token);
        boolean verify = signedJWT.verify(jwsVerifier);
        Date expiration = signedJWT.getJWTClaimsSet().getExpirationTime();
        if(!(verify && expiration.after(new Date()))){

            throw  new AppException(ErrorCode.UNAUTHENTICATED);

        }
        return signedJWT;

    }

//    public String getUsername(String token) throws ParseException, JOSEException {
//        SignedJWT signedJWT = verifyJwt(token);
//        String userName  = signedJWT.getJWTClaimsSet().getSubject();
//        return userName;
//    }

    public String extractUsername(String token){
        try{
            SignedJWT signedJWT = SignedJWT.parse(token);
            return signedJWT.getJWTClaimsSet().getSubject();
        }catch (AppException e){
            log.error("Cannot extract username from JWT", e);
        } catch (ParseException e) {
            log.error("Cannot extract username from JWT", e);
        }
        return null;
    }


    public boolean isTokenValid(String token){
        try{
            SignedJWT signedJWT = SignedJWT.parse(token);
            Date date = signedJWT.getJWTClaimsSet().getExpirationTime();
            return date.after(new Date());
        }catch (AppException e){
            return false;
        } catch (ParseException e) {
            return false;
        }
    }


}
