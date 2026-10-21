package com.kaserdokan.controller;

import com.kaserdokan.service.*;
import com.mongodb.client.*;
import com.mongodb.client.result.UpdateResult;
import jakarta.servlet.http.HttpServletRequest;
import org.bson.Document;
import org.bson.conversions.Bson;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

class SellerDeliveryTest {
    KaserDokanService svc=mock(KaserDokanService.class);
    AuthService auth=mock(AuthService.class);
    MongoCollection<Document> orders=mock(MongoCollection.class);
    FindIterable<Document> found=mock(FindIterable.class);
    HttpServletRequest req=mock(HttpServletRequest.class);
    Document order;
    ApiController api;
    @BeforeEach void setup(){
        order=new Document("_id",new ObjectId()).append("shopId",new ObjectId()).append("userId",new ObjectId()).append("orderType","DELIVERY").append("deliveryMode","MANUAL").append("status","READY").append("paymentMethod","BKASH");
        when(auth.require(req,"SHOP_OWNER")).thenReturn(Map.of("sub","seller","role","SHOP_OWNER"));
        when(svc.c("orders")).thenReturn(orders);
        when(orders.find(any(Bson.class))).thenReturn(found); when(found.first()).thenReturn(order);
        when(svc.ownsShop(eq("seller"),any())).thenReturn(true);
        when(orders.updateOne(any(Bson.class),any(Bson.class))).thenReturn(UpdateResult.acknowledged(1,1L,null));
        api=new ApiController(svc,auth,mock(RealtimeService.class),mock(ImageStorageService.class),"");
    }
    @Test void sellerCanStartAndCompleteManualDelivery(){
        assertNotNull(api.sellerDelivery(req,order.getObjectId("_id").toHexString(),Map.of("status","OUT_FOR_DELIVERY")));
        order.put("status","OUT_FOR_DELIVERY");
        assertNotNull(api.sellerDelivery(req,order.getObjectId("_id").toHexString(),Map.of("status","DELIVERED")));
    }
    @Test void cannotSkipPreparationOrOverrideAssignedRider(){
        order.put("status","PLACED");
        assertThrows(ResponseStatusException.class,()->api.sellerDelivery(req,order.getObjectId("_id").toHexString(),Map.of("status","OUT_FOR_DELIVERY")));
        order.put("status","READY"); order.put("acceptedRiderId",new ObjectId());
        assertThrows(ResponseStatusException.class,()->api.sellerDelivery(req,order.getObjectId("_id").toHexString(),Map.of("mode","MANUAL")));
        verify(orders,never()).updateOne(any(Bson.class),any(Bson.class));
    }
    @Test void cannotChangeAnotherSellersOrder(){
        when(svc.ownsShop(eq("seller"),any())).thenReturn(false);
        assertThrows(ResponseStatusException.class,()->api.sellerDelivery(req,order.getObjectId("_id").toHexString(),Map.of("mode","RIDER")));
    }
}
